# 기존 홈페이지 백업 인벤토리 (구 me.sogang.ac.kr, ~2026-08-26)

홈페이지 관리 업체에서 받은 기존 학과 홈페이지 최종 백업의 내용물 목록.
원본 파일은 **학과 Gmail 계정 구글드라이브 → 기계공학과 홈페이지 → 기존 기계공학과 홈페이지 백업자료(~2026.08.26)** 폴더에 보관한다.
백업 파일 자체는 개인정보(회원 DB 등)를 포함하므로 **이 public 리포에는 절대 올리지 않는다.**

마지막 확인: 2026-08-31 (Claude Code 세션에서 다운로드·검수)

## 원본 파일

| 파일 | 크기 | SHA-256 |
|---|---|---|
| `dsso_mesg-2026-08-26.dump` | 186,799,817 B (약 178MB) | `482da968a749a686f43f4aeb7898dd0369814c0ed055b064edb87d39a81e003b` |
| `dsso_mesg-2026-08-26.tar.gz` | 1,672,450,108 B (약 1.56GB, 압축 해제 시 약 1.9GB / 14,230파일) | `99243502c954213cc7c3749d914abafd28ab8978f7967583b19faa8f1dff3d22` |

무결성 확인: `sha256sum <파일>` 결과가 위 값과 일치해야 한다.

## 1. DB 덤프 (`dsso_mesg-2026-08-26.dump`)

- MySQL 5.1 `mysqldump` 텍스트 덤프, 데이터베이스명 `dsso_mesg`, 총 139개 테이블
- 그누보드4(`g4_*`, 2014년 이전 구 사이트)와 그누보드5(`g5_*`, `/v2/` 사이트) 테이블이 함께 들어 있다
- 실제 게시글은 `g4_write_<bo_table>` / `g5_write_<bo_table>` 테이블에 있다 (행 수에는 댓글 포함)

### 주요 게시판과 행 수 (g5 = 최종 사이트 기준, 괄호는 구 g4)

| bo_table | 게시판 이름 | g5 행 수 | (g4 행 수) | 새 사이트 board |
|---|---|---|---|---|
| sub6_1 | 공지사항 | 853 | (346) | notice / research / award (ca_name 분류) |
| sub6_2 | 장학ㆍ취업정보 | 713 | (522) | scholarship |
| sub6_3 | 심화전공 | 24 | (24) | major |
| sub6_4 | 갤러리 | 28 | (15) | gallery |
| sub6_5 | 자료실 | 24 | (19) | archive |
| sub6_6 | 외부행사 | 67 | (56) | events |
| sub6_9 | 뉴스레터 | 2 | - | (검토) |
| sub7_2 | 동문소식 | 10 | (4) | alumni_news |
| intern / dlsxjs | 인턴(URP 지원) | 955 / 1,355 | (216) | 이관 제외 검토 — 지원서(개인정보) 성격 |
| sub2_1 | 전임교수 | 18 | - | faculty 테이블 |
| sub2_2 | 명예교수 | 6 | - | faculty (emeritus) |
| sub2_3 | 석좌교수 | 1 | - | faculty |
| sub6_7*, sub6_8* | 사용시설 예약 현황 | 약 7,600 | - | 이관 안 함 (새 예약 시스템 사용) |

- 첨부파일 메타데이터: `g5_board_file` 2,277행 / `g4_board_file` 1,799행
- 그 외 g4 시절 학과소개·교과과정 등 정적 페이지성 게시판(sub1_x~sub5_x, eng_*)이 다수 있으나 대부분 1건짜리 HTML 페이지 (새 사이트 `content/`가 대체)

### ⚠️ 개인정보 포함 테이블 (외부 공개·public 업로드 금지)

- `g5_member` 118행, `g4_member` — 회원 정보(비밀번호 해시, 연락처 등)
- `g5_write_intern`, `g5_write_dlsxjs`, `g4_write_intern` — URP/인턴 지원서 게시판 (학생 정보 포함 가능성)
- `g5_login`, `g4_login`, `g5_point`, `g4_visit`, `g5_visit` 등 접속·활동 로그
- 이관 작업 시 위 테이블은 제외하고, 첨부파일도 해당 게시판 폴더(`data/file/intern`, `data/file/dlsxjs`)는 업로드하지 않는다

## 2. 웹 파일 아카이브 (`dsso_mesg-2026-08-26.tar.gz`)

루트는 `www/` (아파치 문서 루트 통째 백업). 주요 구성:

| 경로 | 크기 | 내용 |
|---|---|---|
| `www/v2/data/file/<bo_table>/` | 약 1,030MB | 그누보드5 게시판 첨부파일 (sub6_2 469MB·1,438개, sub6_1 420MB·1,884개, sub6_6 96MB, sub6_4 25MB 등) |
| `www/v2/data/editor/<YYMM>/` | 약 50MB | 에디터 본문 삽입 이미지 |
| `www/data/file/<bo_table>/` | 약 610MB | 그누보드4(구 사이트) 첨부파일 (sub6_2 306MB, sub6_1 208MB 등) |
| `www/v2/` (그 외) | 약 90MB | 그누보드5 PHP 소스·스킨·플러그인·`sqlYG5`(테이블별 SQL 1,192개) |
| `www/` (그 외) | 약 60MB | 그누보드4 소스, 이미지, `br_2014.pdf`(학과 브로슈어 32MB), 뉴스레터 등 |

## 3. 이관 계획

`supabase/migrate_gnuboard.md`의 매핑을 따른다. 실행 준비물:

1. 덤프에서 `g5_write_*`·`g5_board_file`만 파싱 → `posts` 테이블용 import SQL 생성 (`scripts/migrate_gnuboard.py` 참고, 덤프 직접 파싱으로 대체 가능)
2. 첨부파일을 Supabase Storage `media` 버킷 `legacy/<bo_table>/` 아래 업로드 (개인정보 게시판 제외)
3. 본문 내 `/v2/data/...` 경로를 Storage URL로 치환
4. 영문(title_en/content_en)은 이관 후 일괄 번역 (HANDOFF의 번역 파이프라인 항목 참조)

진행 상태는 `docs/HANDOFF.md`에 기록한다.
