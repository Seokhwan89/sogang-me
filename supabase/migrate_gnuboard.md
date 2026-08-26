# 기존 홈페이지(그누보드5) DB → Supabase 이전 가이드

기존 사이트는 그누보드5 구조(`bbs/board.php?bo_table=sub6_1`)이며, 구글 드라이브 백업에는
`g5_write_sub6_1`, `g5_write_sub6_2` … 테이블(SQL 덤프)과 `data/file/<bo_table>/` 첨부파일 폴더가 있을 것입니다.

## 1. 게시판 매핑
| 그누보드 bo_table | 카테고리(ca_name) | Supabase posts.board |
|---|---|---|
| sub6_1 | 공지사항 | notice |
| sub6_1 | 연구성과 | research |
| sub6_1 | 수상 | award |
| sub6_2 | - | scholarship |
| sub6_3 | - | major |
| sub6_4 | - | gallery |
| sub6_5 | - | archive |
| sub6_6 | - | events |
| sub7_2 | - | alumni_news |
| sub2_1 / sub2_2 | - | faculty 테이블 (is_emeritus) |

## 2. 실행 방법
1. 백업 SQL 덤프에서 `g5_write_*` 테이블을 로컬 MySQL/MariaDB 또는 SQLite로 복원합니다.
2. `scripts/migrate_gnuboard.py` 를 실행하면 `posts_import.sql` 이 생성됩니다.
   ```bash
   pip install pymysql
   python scripts/migrate_gnuboard.py --host localhost --user root --password ... --db sogang_me --out posts_import.sql
   ```
3. Supabase SQL Editor에서 `posts_import.sql` 실행.
4. 첨부파일 폴더(`data/file/*`)는 Supabase Storage `media` 버킷의 `legacy/` 아래에 업로드하고,
   스크립트가 생성한 URL 매핑대로 자동 연결됩니다.

## 3. 향후 다른 서버로 이전
- Supabase 대시보드 → Database → Backups 에서 전체 PostgreSQL 덤프 다운로드
- 또는 `pg_dump` 로 표준 SQL 추출 → 교내 서버 PostgreSQL 에 복원
- Storage 파일은 Supabase CLI `supabase storage download` 로 일괄 다운로드
