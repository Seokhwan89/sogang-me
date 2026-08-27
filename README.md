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
Vercel Hobby(무료) + Supabase Free(DB 500MB, 저장소 1GB)로 학과 홈페이지 트래픽은 충분합니다. 저장소가 부족해지면 Supabase Pro($25/월)로 전환..
