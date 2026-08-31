"""Parse the Gnuboard MySQL dump into SQLite for migration prep."""
import re, sqlite3, sys

DUMP = 'dsso_mesg-2026-08-26.dump'
DB = 'legacy.db'

TARGETS = set(
    ['g5_board', 'g5_board_file', 'g4_board', 'g4_board_file'] +
    [f'g5_write_{b}' for b in ['sub6_1','sub6_2','sub6_3','sub6_4','sub6_5','sub6_6','sub6_9','sub7_2']] +
    [f'g4_write_{b}' for b in ['sub6_1','sub6_2','sub6_3','sub6_4','sub6_5','sub6_6','sub7_2']]
)

def parse_values(s):
    """Parse the VALUES payload of one INSERT statement into rows of python values."""
    rows, i, n = [], 0, len(s)
    while i < n:
        while i < n and s[i] in ' ,\n': i += 1
        if i >= n or s[i] != '(':
            break
        i += 1
        row = []
        while True:
            while s[i] in ' ,': i += 1
            c = s[i]
            if c == ')':
                i += 1
                break
            if c == "'":
                i += 1
                buf = []
                while True:
                    c = s[i]
                    if c == '\\':
                        nxt = s[i+1]
                        buf.append({'n':'\n','t':'\t','r':'\r','0':'\0','Z':'\x1a'}.get(nxt, nxt))
                        i += 2
                    elif c == "'":
                        i += 1
                        break
                    else:
                        buf.append(c)
                        i += 1
                row.append(''.join(buf))
            else:
                j = i
                while s[j] not in ',)': j += 1
                tok = s[i:j].strip()
                row.append(None if tok == 'NULL' else tok)
                i = j
        rows.append(row)
    return rows

con = sqlite3.connect(DB)
con.execute('PRAGMA journal_mode=OFF')
cur_table, cols, total = None, {}, {}

with open(DUMP, encoding='utf-8', errors='replace') as f:
    buf_create = None
    for line in f:
        if line.startswith('CREATE TABLE'):
            m = re.search(r'`(\w+)`', line)
            cur_table = m.group(1)
            buf_create = [] if cur_table in TARGETS else None
            continue
        if buf_create is not None:
            m = re.match(r'\s*`(\w+)`', line)
            if m:
                buf_create.append(m.group(1))
            if line.startswith(')') or 'ENGINE=' in line:
                cols[cur_table] = buf_create
                con.execute(f'DROP TABLE IF EXISTS {cur_table}')
                collist = ','.join('"%s"' % c for c in buf_create)
                con.execute(f"CREATE TABLE {cur_table} ({collist})")
                buf_create = None
            continue
        if line.startswith('INSERT INTO'):
            m = re.match(r'INSERT INTO `(\w+)` VALUES (.*);\s*$', line, re.S)
            if not m or m.group(1) not in TARGETS:
                continue
            t = m.group(1)
            rows = parse_values(m.group(2))
            ph = ','.join('?' * len(cols[t]))
            fixed = []
            for r in rows:
                if len(r) != len(cols[t]):
                    print(f'WARN {t}: row width {len(r)} != {len(cols[t])}', file=sys.stderr)
                    continue
                fixed.append(r)
            con.executemany(f'INSERT INTO {t} VALUES ({ph})', fixed)
            total[t] = total.get(t, 0) + len(fixed)

con.commit()
for t in sorted(total):
    print(f'{total[t]:>6}  {t}')
