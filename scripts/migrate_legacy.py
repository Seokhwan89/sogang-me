"""기존 홈페이지(그누보드4+5) 백업 → Supabase posts/Storage 이관 스크립트.

사전 준비 (docs/LEGACY-BACKUP.md 참조):
  1. 백업 덤프를 scripts/parse_dump.py 로 SQLite(legacy.db)로 변환
  2. tar.gz 에서 www/v2/data, www/data 의 대상 게시판 폴더를 추출

사용법:
  python scripts/migrate_legacy.py --db legacy.db --files-root ./www --out ./out plan
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
    python scripts/migrate_legacy.py --db legacy.db --files-root ./www --out ./out upload
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
    python scripts/migrate_legacy.py --db legacy.db --files-root ./www --out ./out insert

- plan   : 네트워크 없이 out/posts.jsonl, out/files_manifest.tsv 생성
- upload : 매니페스트의 파일을 Storage media 버킷 legacy/ 아래 업로드 (재실행 안전)
- insert : posts.jsonl 을 posts 테이블에 삽입 (legacy_id 로 중복 건너뜀)

개인정보 게시판(intern, dlsxjs, member 관련)은 이관 대상에 포함하지 않는다.
"""
import argparse, hashlib, html as htmlmod, json, os, re, sqlite3, sys, urllib.request

BOARD_MAP = {
    'sub6_2': 'scholarship', 'sub6_3': 'major', 'sub6_4': 'gallery',
    'sub6_5': 'archive', 'sub6_6': 'events', 'sub7_2': 'alumni_news',
    'sub6_9': 'archive',  # 뉴스레터 2건
}
CAT_MAP = {'공지사항': 'notice', '공지': 'notice', '수상': 'award', '연구성과': 'research', '': 'notice'}
G5_BOARDS = ['sub6_1', 'sub6_2', 'sub6_3', 'sub6_4', 'sub6_5', 'sub6_6', 'sub6_9', 'sub7_2']
G4_BOARDS = ['sub6_1', 'sub6_2', 'sub6_3', 'sub6_4', 'sub6_5', 'sub6_6', 'sub7_2']
IMG_RE = re.compile(r'\.(jpe?g|png|gif|webp|bmp)$', re.I)
SAFE_RE = re.compile(r'[^A-Za-z0-9._-]')


def safe_key(name):
    """Storage 키로 안전한 파일명 (비ASCII 등은 해시 접미사로 치환)."""
    if not SAFE_RE.search(name):
        return name
    root, ext = os.path.splitext(name)
    h = hashlib.md5(name.encode('utf-8')).hexdigest()[:8]
    root = SAFE_RE.sub('_', root)[:60]
    ext = SAFE_RE.sub('', ext)[:10]
    return f'{root}-{h}{ext and "." + ext}'


def board_of(src, bo, ca_name):
    if bo == 'sub6_1':
        return CAT_MAP.get((ca_name or '').strip(), 'notice')
    return BOARD_MAP[bo]


def content_html(row):
    c = row['wr_content'] or ''
    if 'html' in (row.get('wr_option') or ''):
        return c
    return '<p>' + htmlmod.escape(c).replace('\r\n', '\n').replace('\n', '<br>\n') + '</p>'


def collect(con):
    """이관 대상 게시글 + 첨부 목록을 만든다. returns (posts, files) — url은 {{MEDIA}} 프리픽스."""
    posts, files = [], {}   # files: local rel path -> storage key

    def register(local_rel, storage_dir, fname):
        key = f'{storage_dir}/{safe_key(fname)}'
        files[local_rel] = key
        return '{{MEDIA}}/' + key

    def attach_list(gen, prefix_local, prefix_storage, bo, wr_id, table):
        out = []
        for bf in con.execute(
                f"select bf_source, bf_file, bf_filesize from {table} "
                f"where bo_table=? and cast(wr_id as int)=? order by cast(bf_no as int)", (bo, wr_id)):
            src, fname, size = bf
            if not fname:
                continue
            url = register(f'{prefix_local}/{bo}/{fname}', f'{prefix_storage}/{bo}', fname)
            out.append({'name': src or fname, 'url': url, 'size': int(size or 0)})
        return out

    def rows_of(g, bo, extra_where=''):
        t = f'{g}_write_{bo}'
        cols = [d[1] for d in con.execute(f'PRAGMA table_info({t})')]
        for r in con.execute(f"select * from {t} where cast(wr_is_comment as int)=0 {extra_where}"):
            yield dict(zip(cols, r))

    # g5 전체
    for bo in G5_BOARDS:
        for r in rows_of('g5', bo):
            atts = attach_list('g5', 'www/v2/data/file', 'legacy/v2/data/file', bo, int(r['wr_id']), 'g5_board_file')
            posts.append(make_post('g5', bo, r, atts))
    # g4 단독 글 (g5에 같은 제목+날짜가 없는 것)
    for bo in G4_BOARDS:
        for r in rows_of('g4', bo):
            dup = con.execute(
                f"select 1 from g5_write_{bo} c where c.wr_subject=? and substr(c.wr_datetime,1,10)=? limit 1",
                (r['wr_subject'], (r['wr_datetime'] or '')[:10])).fetchone()
            if dup:
                continue
            atts = attach_list('g4', 'www/data/file', 'legacy/data/file', bo, int(r['wr_id']), 'g4_board_file')
            posts.append(make_post('g4', bo, r, atts))

    # 본문 삽입 이미지 경로 재작성 + 해당 파일 등록
    path_map = {}
    for p in posts:
        c = p['content_ko']
        for m in re.finditer(r'''(?:src|href)=["']([^"']+)["']''', c):
            u = m.group(1)
            rel = re.sub(r'^https?://[^/]*me\.sogang\.ac\.kr', '', u)
            if rel.startswith('/v2/data/') or rel.startswith('/data/'):
                local = 'www' + rel
                if rel not in path_map:
                    fname = os.path.basename(rel)
                    sdir = 'legacy' + os.path.dirname(rel)
                    path_map[rel] = register(local, sdir, fname)
                c = c.replace(u, path_map[rel])
        p['content_ko'] = c
    return posts, files


def make_post(g, bo, r, atts):
    board = board_of(g, bo, r.get('ca_name'))
    title = (r['wr_subject'] or '').strip()
    if g == 'g4' and bo == 'sub6_1':  # g4 공지사항은 분류가 없어 제목 접두어로 추정
        if title.startswith('[수상]'):
            board = 'award'
        elif title.startswith(('[연구', '[논문')):
            board = 'research'
    content = content_html(r)
    images = [a for a in atts if IMG_RE.search(a['name'] or '')]
    text = htmlmod.unescape(re.sub(r'<[^>]+>', ' ', content))
    excerpt = re.sub(r'\s+', ' ', text).strip()[:160]
    dt = (r['wr_datetime'] or '').strip() or None
    return {
        'board': board,
        'title_ko': title or '(제목 없음)',
        'content_ko': content,
        'excerpt_ko': excerpt,
        'thumbnail_url': images[0]['url'] if images else None,
        'images': [{'url': a['url'], 'caption': a['name']} for a in images] if BOARD_MAP.get(bo) == 'gallery' else [],
        'attachments': atts,
        'author': (r.get('wr_name') or '기계공학과').strip() or '기계공학과',
        'view_count': int(r.get('wr_hit') or 0),
        'legacy_id': f'{g}:{bo}:{r["wr_id"]}',
        'published': True,
        'created_at': dt,
        'updated_at': dt,
    }


def sb_request(url, method='GET', data=None, headers=None, raw=False):
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    h = {'apikey': key, 'Authorization': f'Bearer {key}'}
    h.update(headers or {})
    body = data if raw else (json.dumps(data).encode() if data is not None else None)
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--db', default='legacy.db')
    ap.add_argument('--files-root', default='.')
    ap.add_argument('--out', default='./out')
    ap.add_argument('phase', choices=['plan', 'upload', 'insert'])
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    posts_path = os.path.join(a.out, 'posts.jsonl')
    manifest_path = os.path.join(a.out, 'files_manifest.tsv')

    if a.phase == 'plan':
        con = sqlite3.connect(a.db)
        con.row_factory = None
        posts, files = collect(con)
        missing = 0
        with open(manifest_path, 'w', encoding='utf-8') as f:
            for local, key in sorted(files.items()):
                p = os.path.join(os.path.dirname(a.files_root), local) if a.files_root.endswith('www') else os.path.join(a.files_root, local)
                exists = os.path.exists(os.path.join(a.files_root, os.path.relpath(local, 'www')))
                if not exists:
                    missing += 1
                f.write(f'{local}\t{key}\t{int(exists)}\n')
        with open(posts_path, 'w', encoding='utf-8') as f:
            for p in posts:
                f.write(json.dumps(p, ensure_ascii=False) + '\n')
        from collections import Counter
        print(f'게시글 {len(posts)}건 → {posts_path}')
        for b, n in Counter(p['board'] for p in posts).most_common():
            print(f'  {b:12} {n}')
        print(f'파일 {len(files)}개 → {manifest_path} (백업에 없는 파일 {missing}개)')
        return

    base = os.environ['SUPABASE_URL'].rstrip('/')
    if a.phase == 'upload':
        done = err = skip = 0
        for line in open(manifest_path, encoding='utf-8'):
            local, key, exists = line.rstrip('\n').split('\t')
            if exists != '1':
                skip += 1
                continue
            path = os.path.join(a.files_root, os.path.relpath(local, 'www'))
            data = open(path, 'rb').read()
            try:
                sb_request(f'{base}/storage/v1/object/media/{key}', 'POST', data, {
                    'Content-Type': 'application/octet-stream', 'x-upsert': 'true'}, raw=True)
                done += 1
            except Exception as e:
                err += 1
                print(f'ERR {key}: {e}', file=sys.stderr)
            if done % 200 == 0 and done:
                print(f'... {done} uploaded')
        print(f'업로드 {done}, 실패 {err}, 원본 없음 건너뜀 {skip}')
        return

    if a.phase == 'insert':
        media = f'{base}/storage/v1/object/public/media'
        status, body = sb_request(f'{base}/rest/v1/posts?select=legacy_id&legacy_id=not.is.null', 'GET')
        existing = {r['legacy_id'] for r in json.loads(body)}
        batch, n_new, n_dup = [], 0, 0

        def flush():
            if not batch:
                return
            sb_request(f'{base}/rest/v1/posts', 'POST', batch, {
                'Content-Type': 'application/json', 'Prefer': 'return=minimal'})
            batch.clear()

        for line in open(posts_path, encoding='utf-8'):
            p = json.loads(line)
            if p['legacy_id'] in existing:
                n_dup += 1
                continue
            s = json.dumps(p, ensure_ascii=False).replace('{{MEDIA}}', media)
            batch.append(json.loads(s))
            n_new += 1
            if len(batch) >= 50:
                flush()
        flush()
        print(f'삽입 {n_new}건, 기존 legacy_id 중복 건너뜀 {n_dup}건')


if __name__ == '__main__':
    main()
