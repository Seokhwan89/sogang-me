"""Gnuboard5 (g5_write_*) -> Supabase posts import SQL generator."""
import argparse, re, html
import pymysql

MAP = {
    'sub6_1': None,  # split by category
    'sub6_2': 'scholarship', 'sub6_3': 'major', 'sub6_4': 'gallery',
    'sub6_5': 'archive', 'sub6_6': 'events', 'sub7_2': 'alumni_news',
}
CAT = {'공지사항': 'notice', '연구성과': 'research', '수상': 'award'}

def q(v):
    if v is None: return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='localhost'); ap.add_argument('--user', required=True)
    ap.add_argument('--password', required=True); ap.add_argument('--db', required=True)
    ap.add_argument('--out', default='posts_import.sql')
    ap.add_argument('--media-base', default='https://<project>.supabase.co/storage/v1/object/public/media/legacy')
    a = ap.parse_args()
    conn = pymysql.connect(host=a.host, user=a.user, password=a.password, db=a.db, charset='utf8mb4')
    cur = conn.cursor(pymysql.cursors.DictCursor)
    rows = []
    for table, board in MAP.items():
        cur.execute(f"select * from g5_write_{table} where wr_is_comment=0 order by wr_id")
        for r in cur.fetchall():
            b = board or CAT.get(r.get('ca_name') or '', 'notice')
            files = []
            cur2 = conn.cursor(pymysql.cursors.DictCursor)
            cur2.execute("select bf_source, bf_file, bf_filesize from g5_board_file where bo_table=%s and wr_id=%s", (table, r['wr_id']))
            for f in cur2.fetchall():
                files.append({'name': f['bf_source'], 'url': f"{a.media_base}/{table}/{f['bf_file']}", 'size': f['bf_filesize']})
            images = [f for f in files if re.search(r'\.(jpe?g|png|gif|webp)$', f['name'], re.I)]
            thumb = images[0]['url'] if images else None
            content = r['wr_content'] or ''
            content = content.replace('/v2/data/', f"{a.media_base}/../")
            excerpt = html.unescape(re.sub('<[^>]+>', ' ', content))[:160].strip()
            import json
            rows.append("(%s,%s,%s,%s,%s,%s::jsonb,%s::jsonb,%s,%s,%s,%s,%s)" % (
                q(b), q(r['wr_subject']), q(content), q(excerpt), q(thumb),
                q(json.dumps([{'url': i['url'], 'caption': ''} for i in images], ensure_ascii=False)),
                q(json.dumps(files, ensure_ascii=False)), q(r.get('wr_name')),
                'true' if r.get('wr_option', '').find('notice') >= 0 else 'false',
                q(r['wr_hit']), q(f"{table}:{r['wr_id']}"), q(str(r['wr_datetime']))))
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write("insert into posts (board,title_ko,content_ko,excerpt_ko,thumbnail_url,images,attachments,author,is_pinned,view_count,legacy_id,created_at) values\n")
        f.write(",\n".join(rows) + ";\n")
    print(f"wrote {len(rows)} posts -> {a.out}")

if __name__ == '__main__':
    main()
