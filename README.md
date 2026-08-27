# 서강대학교 기계공학과 홈페이지 (Sogang ME)

Next.js 14 · Supabase(DB/인증/파일) · Vercel(호스팅) · 국문/영문 · 관리자 페이지 · AI 자동 번역

## 구성
| 경로 | 내용 |
|---|---|
| `app/[locale]/…` | 공개 사이트 (`/ko`, `/en`) |
| `app/admin/…` | 관리자 (실제 주소는 `.env`의 `ADMIN_PATH`, 예: `https://도메인/me-console-7f3a`) |
| `content/` | 소개·교과과정 등 고정 페이지 본문(국/영), 연혁, 학사일정, 연구분야 데이터 |
| `supabase/schema.sql` | DB 테이블·권한·저장소 (Supabase SQL Editor에서 1회 실행) |
| `supabase/seed_*.sql` | 교수진 24명, 최근 게시글, 예약 예시 |
| `scripts/migrate_gnuboard.py` | 기존 그누보드 DB 백업 → 전체 게시글 이전 |

## 배포 순서 (약 30분)
1. **Supabase** (https://supabase.com) → New project (Region: Northeast Asia/Seoul)
   - SQL Editor → `supabase/schema.sql` 붙여넣고 Run → 이어서 `seed_faculty.sql`, `seed_posts.sql` Run
   - Authentication → Users → **Add user** (관리자 이메일/비밀번호, "Auto confirm" 체크)
   - SQL Editor: `insert into admins (email) values ('관리자이메일');`
   - Project Settings → API 에서 `Project URL`, `anon public`, `service_role` 키 복사
2. **GitHub** → 새 저장소(Private 권장)에 이 폴더 업로드 (`node_modules`, `.env` 제외)
3. **Vercel** (https://vercel.com) → Add New Project → GitHub 저장소 Import
   - Environment Variables 에 `.env.example` 의 항목 입력:
     `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PATH`, `NEXT_PUBLIC_SITE_URL`, (선택) `ANTHROPIC_API_KEY`
   - Deploy → `https://프로젝트.vercel.app` 에서 확인
4. **도메인**: Vercel → Settings → Domains → `me.sogang.ac.kr` 추가 → 학교 전산실에 CNAME(`cname.vercel-dns.com`) 등록 요청
5. **관리자 접속**: `https://도메인/ADMIN_PATH값` → 로그인

## 로컬 실행
```bash
cp .env.example .env.local   # 값 채우기
npm install && npm run dev   # http://localhost:3000
```

## 운영
- 게시글/교수/예약/배너/메인 섹션: 관리자 페이지에서 관리
- 영문: 관리자에서 국문만 입력하고 저장하면(또는 "AI 영문 번역" 버튼) 영문이 자동 생성됩니다. 기본은 무료 번역기(Google 웹 엔드포인트/MyMemory)이며, `ANTHROPIC_API_KEY`를 넣으면 코드 수정 없이 Claude 고품질 번역으로 전환됩니다.
- 접속 국가가 KR이면 `/ko`, 그 외는 `/en` 으로 자동 이동, 우상단 국기 버튼으로 전환
- 서강대 UI: `components/Logo.tsx` 의 임시 엠블럼을 공식 로고 파일(`public/images/`)로 교체, 색상은 `app/globals.css` 의 `--sg-red`
- 기존 게시글 전체 이전: `supabase/migrate_gnuboard.md`
- 타 서버 이전: Supabase는 표준 PostgreSQL이라 `pg_dump` 로 전량 추출 가능 (Database → Backups)

## 비용
Vercel Hobby(무료) + Supabase Free(DB 500MB, 저장소 1GB)로 학과 홈페이지 트래픽은 충분합니다. 저장소가 부족해지면 Supabase Pro($25/월)로 전환.

## v3 (2026-08-27) 변경 사항 — 이승엽 교수님 요청 반영
### 새 메뉴 (학부과정 아래)
| 메뉴 | 경로 | 데이터 |
|---|---|---|
| 전공소개 | `/undergraduate/majors` | `content/majors.ts` (4대 분야 원고·과목·추천교과목) + `/images/intro/*.jpg` (PDF 15쪽 렌더) |
| 전공 홍보자료 | `/board/promo` | posts(board=`promo`), 첨부 PDF는 `/public/docs/` |
| 창의적종합설계 | `/board/capstone` | posts(board=`capstone`) — term(`2025-2`), members, advisor, sort_order(조 번호), thumbnail(포스터) |
| 학술제 학부생 발표 | `/board/festival` | posts(board=`festival`) — term(연도), category(ureca/capstone/project/award), members, advisor, 포스터 |
| 기계공학도가 봐야 할 영상 | `/board/videos` | posts(board=`videos`) — video_url(YouTube), category(그룹 제목), sort_order |
### 기능
- 모든 게시판에 **YouTube 주소** 입력 가능 → 본문 위에 영상, 카드 썸네일 자동
- 게시글 **줄바꿈 자동 처리** (Enter = 줄바꿈, 빈 줄 = 문단)
- **URECA 인턴 온라인 지원** (`/undergraduate/ureca` 하단) → 관리자 > URECA 지원 (연도·기간 필터, 선발/미선발, CSV)
- **이메일 알림**: 시설 예약·URECA 지원 접수 시 관리자 설정의 이메일로 발송. Vercel 환경변수 `RESEND_API_KEY` 필요(resend.com 무료). 미설정 시 접수만 되고 메일은 생략
- 메인: 히어로 아래 **전공 홍보자료 카드 2개**, 소식 4줄째 **동문·구성원 소식**, **추천 영상** 섹션
### DB 마이그레이션
Supabase SQL Editor에서 `supabase/schema_v3.sql` → `supabase/seed_v3.sql` 순서로 실행
### 관리자 등록 방법
관리자 > 게시판 > 해당 게시판 선택 > "+ 새 글". 창의적종합설계·학술제·영상 게시판을 고르면 학년도/조원/지도교수/구분/순서 입력칸이 나타납니다. 포스터는 "사진 추가"로 올리고 "대표" 지정.
### 아직 없는 원본 자료 (관리자가 추후 등록)
- 2025-2, 2026-1 창의적종합설계 **포스터** (메일 첨부 만료 — 이승엽 교수님/박현주 선생님께 재요청)
- 학술제 학부생 발표 자료(URECA·창의적종합설계·연구프로젝트)와 **학부생 수상자 명단** — 학과 행정팀 보유 자료

## v5 (2026-08-27) 안정화 수정
| 항목 | 내용 |
|---|---|
| 시설 예약 중복 | 시간 입력 즉시 겹침 경고 + 서버에서도 차단(409). 관리자 승인 목록은 확정 예약과 겹치면 붉게 표시 |
| 과거 날짜 예약 | 달력에서 선택 불가 + 서버 검증 (KST 기준) |
| URECA 중복 지원 | 같은 연도·학기·학번이면 마지막 제출본으로 자동 대체, 폼에 안내 문구 표시 |
| 검색어 오류 | `%`, `,`, `(` 등 특수문자를 정제(`lib/search.ts`). 조원 이름으로도 검색됨 |
| 연구실 수 | 메인 '대학원과정' 카드의 연구실 수를 교수 DB에서 집계 |
| 업로드 | 이미지 자동 축소(최대 1920px, JPEG 82%), 10MB 초과 거부 |
| 저장소 정리 | 글·교수·배너 삭제 시 첨부·본문 이미지도 Storage에서 삭제 |
| 조회수 | 세션당 1회만 집계(`/api/view` + sessionStorage), 봇 UA 제외 |

### 아직 코드로 관리하는 항목 (의도적)
- 4개 기초전공분야 이름·설명, 7개 연구그룹 이름 (`content/pages-grad.ts`, `lib/groups.ts`)
- 학사일정 (`content/pages-ug.ts`의 `calendar2026`) — 매년 갱신 시 요청
- 메뉴 구조·게시판 목록 (`lib/nav.ts`), 화면 문구 (`lib/i18n.ts`)
