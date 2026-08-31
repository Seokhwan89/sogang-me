"""레거시 이관 후 정리: 중복 게시글 병합·비공개 처리 + 썸네일/옛 도메인 URL 정리.

사용법:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/fix_legacy_content.py plan
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/fix_legacy_content.py apply

- plan  : 변경 계획만 출력 (DB 수정 없음)
- apply : 실제 반영. 중복은 삭제하지 않고 published=false 처리 (복구 가능, 재실행 안전)

하는 일:
1) 중복 정리 — 같은 board·제목 그룹에서
   - 시드/수기 글(본문 없음)과 legacy 글이 겹치면: legacy를 남기고 영문 제목·플래그를 이식, 시드는 비공개
   - 정성 작성된 수기 글(연구성과·수상 등)과 legacy가 겹치면: 수기 글을 남기고 legacy의
     첨부·썸네일·조회수·legacy_id를 이식, legacy는 비공개
   - legacy끼리 같은 날 같은 소스 중복, g4/g5 교차(45일 이내) 중복: 빈약한 쪽 비공개
2) 옛 도메인(me.sogang.ac.kr) 파일 URL → Storage URL 치환 (Storage에 원본이 있는 것만)
3) 갤러리 글 썸네일 보강: 썸네일이 없으면 본문 첫 이미지 사용
4) 썸네일 URL 검증: 깨진 URL은 images[0] → 본문 첫 이미지 → null 순으로 대체
"""
import os, sys, json, re, hashlib, collections, urllib.request, urllib.error
from datetime import datetime

BASE = os.environ['SUPABASE_URL'].rstrip('/')
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
APPLY = len(sys.argv) > 1 and sys.argv[1] == 'apply'
MEDIA = f'{BASE}/storage/v1/object/public/media'
SAFE_RE = re.compile(r'[^A-Za-z0-9._-]')
# 같은 행사인데 사진이 늦게 게시돼 날짜가 어긋난 시드·legacy 쌍 (2026-08-31 검증)
FORCED_PAIRS = {(71, 1730), (72, 1729), (76, 1721)}


def req(path, method='GET', data=None, full_url=None):
    r = urllib.request.Request(full_url or f'{BASE}{path}', method=method,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'apikey': KEY, 'Authorization': f'Bearer {KEY}',
                 'Content-Type': 'application/json', 'Prefer': 'return=minimal'})
    return urllib.request.urlopen(r)


def fetch_all(table, select='*'):
    rows, off = [], 0
    while True:
        b = json.load(req(f'/rest/v1/{table}?select={select}&order=id&limit=1000&offset={off}'))
        rows += b
        if len(b) < 1000: break
        off += 1000
    return rows


_HEAD_CACHE = {}

def head_ok(url):
    if url in _HEAD_CACHE: return _HEAD_CACHE[url]
    try:
        r = urllib.request.Request(url, method='HEAD')
        ok = urllib.request.urlopen(r, timeout=15).status == 200
    except Exception:
        ok = False
    _HEAD_CACHE[url] = ok
    return ok


def prefetch_heads(urls, workers=20):
    """URL 존재 여부를 병렬로 미리 확인해 캐시에 채운다."""
    from concurrent.futures import ThreadPoolExecutor
    todo = [u for u in set(urls) if u and u not in _HEAD_CACHE]
    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(head_ok, todo))


def safe_key(name):
    if not SAFE_RE.search(name): return name
    root, ext = os.path.splitext(name)
    h = hashlib.md5(name.encode()).hexdigest()[:8]
    return f"{SAFE_RE.sub('_', root)[:60]}-{h}{SAFE_RE.sub('', ext)[:10] and '.' + SAFE_RE.sub('', ext)[:10]}"


def storage_candidate(url):
    """me.sogang.ac.kr 파일 URL → 대응하는 Storage URL (없으면 None)."""
    m = re.match(r'https?://me\.sogang\.ac\.kr(/v2/data/|/data/)(.+)$', url)
    if not m: return None
    rel = m.group(1).lstrip('/') + m.group(2)
    d, fn = os.path.dirname(rel), os.path.basename(rel)
    return f'{MEDIA}/legacy/{d}/{safe_key(fn)}'


def first_content_img(html):
    for m in re.finditer(r'''<img[^>]+src=["']([^"']+)["']''', html or '', re.I):
        u = m.group(1)
        if u.startswith(MEDIA) and head_ok(u):
            return u
    return None


def norm(t): return re.sub(r'[\s\.\'"’‘“”\-–—\[\]()]+', '', (t or '').lower())
def txt(h): return re.sub(r'<[^>]+>', '', h or '').strip()
def day(r): return (r['created_at'] or '')[:10]
def dt(r):
    try: return datetime.fromisoformat(day(r))
    except Exception: return datetime(1970, 1, 1)


def dedupe(posts):
    full = {p['id']: p for p in posts}
    groups = collections.defaultdict(list)
    for r in posts:
        if r.get('published'):
            groups[(r['board'], norm(r['title_ko']))].append(r)
    patches, unpublish, log = {}, [], []
    for k, v in groups.items():
        if len(v) < 2: continue
        Ls = [full[r['id']] for r in v if r['legacy_id']]
        Ms = [full[r['id']] for r in v if not r['legacy_id']]
        taken = set()
        for m in Ms:
            cand = [l for l in Ls if l['id'] not in taken]
            if not cand: continue
            l = min(cand, key=lambda x: abs((dt(x) - dt(m)).days))
            forced = (m['id'], l['id']) in FORCED_PAIRS
            if abs((dt(l) - dt(m)).days) > 90 and not forced: continue
            taken.add(l['id'])
            if len(txt(m['content_ko'])) > 0:
                p = patches.setdefault(m['id'], {})
                if not (m['attachments'] or []): p['attachments'] = l['attachments']
                if not (m['images'] or []) and (l['images'] or []): p['images'] = l['images']
                if not m['thumbnail_url'] and l['thumbnail_url']: p['thumbnail_url'] = l['thumbnail_url']
                p['view_count'] = max(m['view_count'] or 0, l['view_count'] or 0)
                p['legacy_id'] = l['legacy_id']
                unpublish.append(l['id'])
                log.append(f"KEEP M{m['id']} <- merge L{l['id']} [{m['board']}] {m['title_ko'][:38]}")
            else:
                p = patches.setdefault(l['id'], {})
                for f in ('title_en', 'content_en', 'excerpt_en'):
                    if not l.get(f) and m.get(f): p[f] = m[f]
                if m.get('show_on_home'): p['show_on_home'] = True
                if m.get('is_pinned'): p['is_pinned'] = True
                if not l['thumbnail_url'] and m['thumbnail_url']: p['thumbnail_url'] = m['thumbnail_url']
                if forced: p['created_at'] = m['created_at']
                unpublish.append(m['id'])
                log.append(f"KEEP L{l['id']} <- en/flags from seed M{m['id']} [{m['board']}] {m['title_ko'][:38]}")
        # legacy끼리 확실 중복
        Ls2 = [l for l in Ls if l['id'] not in unpublish and l['id'] not in patches]
        for i in range(len(Ls2)):
            for j in range(i + 1, len(Ls2)):
                a, b = Ls2[i], Ls2[j]
                if a['id'] in unpublish or b['id'] in unpublish: continue
                sa, sb = a['legacy_id'].split(':')[0], b['legacy_id'].split(':')[0]
                gap = abs((dt(a) - dt(b)).days)
                if sa == sb and day(a) == day(b):
                    score = lambda r: (len(r['attachments'] or []), r['view_count'] or 0)
                    keep, drop = (a, b) if score(a) >= score(b) else (b, a)
                elif sa != sb and gap <= 45:
                    keep, drop = (a, b) if sa == 'g5' else (b, a)
                    extra = [x for x in (drop['attachments'] or [])
                             if x['name'] not in {y['name'] for y in (keep['attachments'] or [])}]
                    if extra:
                        patches.setdefault(keep['id'], {})['attachments'] = (keep['attachments'] or []) + extra
                else:
                    continue
                unpublish.append(drop['id'])
                log.append(f"DEDUP keep {keep['legacy_id']}({keep['id']}) drop {drop['legacy_id']}({drop['id']}) [{keep['board']}] {keep['title_ko'][:35]}")
    return patches, unpublish, log, full


def rewrite_old_domain(s):
    """문자열 내 me.sogang 파일 URL을 Storage URL로 치환. (치환결과, 바뀜여부)"""
    changed = False
    for old in set(re.findall(r'https?://me\.sogang\.ac\.kr/(?:v2/)?data/[^"\'\s)<>]+', s or '')):
        cand = storage_candidate(old)
        if cand and head_ok(cand):
            s = s.replace(old, cand)
            changed = True
    return s, changed


def main():
    posts = fetch_all('posts')
    patches, unpublish, log, full = dedupe(posts)
    for line in log: print(' ', line)
    print(f'dedupe: patch {len(patches)}, unpublish {len(unpublish)}')

    # 검증 대상 URL을 미리 모아 병렬로 확인 (순차 HEAD는 너무 느림)
    to_check = []
    img_re = re.compile(r'''<img[^>]+src=["']([^"']+)["']''', re.I)
    for p in posts:
        if p['id'] in unpublish: continue
        t = patches.get(p['id'], {}).get('thumbnail_url', p['thumbnail_url'])
        if t and t.startswith(MEDIA): to_check.append(t)
        for s in (p['content_ko'], p['content_en']):
            for u in set(re.findall(r'https?://me\.sogang\.ac\.kr/(?:v2/)?data/[^"\'\s)<>]+', s or '')):
                c = storage_candidate(u)
                if c: to_check.append(c)
            if s:
                to_check += [u for u in img_re.findall(s) if u.startswith(MEDIA)]
        for a in (p['images'] or []) + (p['attachments'] or []):
            u = a.get('url') or ''
            if u.startswith(MEDIA): to_check.append(u)
            elif 'me.sogang.ac.kr' in u:
                c = storage_candidate(u)
                if c: to_check.append(c)
        if t and 'me.sogang.ac.kr' in t:
            c = storage_candidate(t)
            if c: to_check.append(c)
    prefetch_heads(to_check)

    # 2) 옛 도메인 URL 치환 + 3) 갤러리 썸네일 보강 + 4) 썸네일 검증
    for p in posts:
        if p['id'] in unpublish: continue
        upd = patches.setdefault(p['id'], {})
        cur_thumb = upd.get('thumbnail_url', p['thumbnail_url'])
        cur_ck = upd.get('content_ko', p['content_ko'])
        # 옛 도메인 치환
        for f, cur in (('content_ko', cur_ck), ('content_en', p['content_en'])):
            if cur and 'me.sogang.ac.kr' in cur:
                new, ch = rewrite_old_domain(cur)
                if ch: upd[f] = new
        for f in ('images', 'attachments'):
            arr = upd.get(f, p[f]) or []
            ch = False
            for a in arr:
                if a.get('url') and 'me.sogang.ac.kr' in a['url']:
                    new, c2 = rewrite_old_domain(a['url'])
                    if c2: a['url'] = new; ch = True
            if ch: upd[f] = arr
        if cur_thumb and 'me.sogang.ac.kr' in cur_thumb:
            new, ch = rewrite_old_domain(cur_thumb)
            if ch: cur_thumb = upd['thumbnail_url'] = new
        # 갤러리 썸네일 보강
        if not cur_thumb and p['board'] == 'gallery' and p.get('published'):
            img = first_content_img(upd.get('content_ko', p['content_ko']))
            if img: cur_thumb = upd['thumbnail_url'] = img
        # 썸네일 검증: 치환 못 한 옛 도메인 URL(만료 예정)이거나 깨진 Storage URL이면 대체
        if cur_thumb:
            bad = ('me.sogang.ac.kr' in cur_thumb) or (cur_thumb.startswith(MEDIA) and not head_ok(cur_thumb))
            if bad:
                fb = None
                for a in (upd.get('images', p['images']) or []):
                    if a.get('url', '').startswith(MEDIA) and head_ok(a['url']):
                        fb = a['url']; break
                fb = fb or first_content_img(upd.get('content_ko', p['content_ko']))
                upd['thumbnail_url'] = fb  # 대체 없으면 None → 기본 커버로 표시
        if not patches[p['id']]:
            del patches[p['id']]

    # faculty 옛 도메인 치환
    fac_patches = {}
    try:
        for f in fetch_all('faculty'):
            upd = {}
            for k, v in f.items():
                if isinstance(v, str) and 'me.sogang.ac.kr' in v:
                    new, ch = rewrite_old_domain(v)
                    if ch: upd[k] = new
            if upd: fac_patches[f['id']] = upd
    except Exception as e:
        print('faculty skip:', e)

    print(f'total: posts patch {len(patches)}, unpublish {len(unpublish)}, faculty patch {len(fac_patches)}')
    if not APPLY:
        print('(plan only — apply 로 실행하면 반영됩니다)')
        return

    json.dump([full[i] for i in unpublish if i in full],
              open('unpublished_backup.json', 'w'), ensure_ascii=False)
    for i in unpublish:
        body = {'published': False, 'show_on_home': False, 'is_pinned': False}
        old = full[i]
        if old.get('legacy_id') and any(pp.get('legacy_id') == old['legacy_id'] for pp in patches.values()):
            body['legacy_id'] = 'dup:' + old['legacy_id']
        req(f'/rest/v1/posts?id=eq.{i}', 'PATCH', body)
    print('unpublished', len(unpublish))
    for pid, p in patches.items():
        req(f'/rest/v1/posts?id=eq.{pid}', 'PATCH', p)
    print('patched posts', len(patches))
    for fid, p in fac_patches.items():
        req(f'/rest/v1/faculty?id=eq.{fid}', 'PATCH', p)
    print('patched faculty', len(fac_patches))


if __name__ == '__main__':
    main()
