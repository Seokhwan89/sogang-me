# HANDOFF — 세션 간 인수인계

마지막 갱신: 2026-08-31

## 완료 (최근)
- **기존 홈페이지 → 새 사이트 전체 콘텐츠 이관 완료** (2026-08-31): `docs/LEGACY-BACKUP.md`의 파이프라인 실행 완료. 백업 2개 다운로드·SHA-256 검증 → `parse_dump.py` → plan/upload/insert 전부 성공
  - 게시글 **2,275건** 삽입 (scholarship 1,233 / notice 668 / award 124 / events 93 / research 65 / gallery 29 / archive 29 / major 24 / alumni_news 10) — plan 검증값과 정확히 일치, posts 테이블 총 2,353건
  - 첨부·본문 이미지 **3,216개(1.27GB)** Storage `media` 버킷 `legacy/` 업로드 (백업에 원본 없는 2개만 제외, 업로드 실패 0)
  - 검수: board별 건수 일치, 본문 `{{MEDIA}}` 플레이스홀더 잔여 0건, 첨부·본문 이미지 공개 URL 200 확인. **게시판 화면 최종 확인은 브라우저에서 필요**
- 기존 홈페이지 백업(업체 제공, 구글드라이브 보관) 다운로드·검수 완료: 그누보드4+5 MySQL 덤프 + 웹파일 1.9GB. 내용물 목록·체크섬·개인정보 주의 테이블은 `docs/LEGACY-BACKUP.md` 참조
- 전공소개 페이지(`/undergraduate/majors`) 전면 재작성: 4개 분야를 공식 순서로 정렬, 각 분야를 고유 정체성+산업 응용 중심으로 서술, Physical AI는 트렌드 연결로만 언급 (`content/majors.ts`, ko/en)
- 전공소개 상단: 캡처 이미지(physical-ai-overview.jpg) 제거 → 네이티브 다이어그램으로 대체. Physical AI 허브(신경망 SVG 심볼 + SMIL 애니메이션) → 연결선 → 4개 분야 카드(역할: 골격과 근육 / 혈관과 호흡 / 두뇌와 신경 / 실체로 만드는 손), 카드 클릭 시 해당 분야 앵커로 이동 (`app/[locale]/undergraduate/[slug]/page.tsx`)
- 홈 히어로 4대 분야 스트립 모바일 수정: 엠블럼+텍스트 가로 배치가 390px에서 깨지던 것을 세로 배치로 전환 (`components/HeroVideo.tsx`)
- 홈 4대 분야 카드 모바일 수정: 텍스트 폭 60% 제한 해제, 배경 엠블럼 모바일 투명도 축소 (`app/[locale]/page.tsx`)
- 전체 콘텐츠 파일에서 Physical AI 편중 점검 완료: `pages-grad.ts`, `pages-ug.ts`, `areas.ts`, `i18n.ts`는 이미 균형 잡혀 있어 미수정

## 진행 중 — 다음 세션이 이어서 할 것
- **Supabase Storage → Cloudflare R2 무료 이전 (책임자 승인됨, 2026-08-31)**: 책임자가 Cloudflare 가입·R2 버킷 생성·API 토큰 발급을 마치면(지침 전달됨) `legacy/` 1.27GB를 R2로 복사 → DB URL 일괄 치환(posts content/thumbnail/attachments, faculty.photo_url) → 검증 후 Supabase 쪽 legacy/ 삭제해 무료 한도(1GB) 아래로 내릴 것. R2 무료 한도: 저장 10GB·egress 무제한 무료(Class A 100만/Class B 1,000만 op/월)

## 완료 (2026-08-31 밤 추가)
- **디자인 개편 브랜치 main 병합·배포** (책임자 미리보기 승인): 홈 히어로 **14영상** 순환(분야 교차 라운드로빈+CSS 폴백)·콘셉트 이미지 전면 교체·페이지 히어로 SVG 애니메이션·글라스 헤더·산학 트랙 기업 로고 배너·홈 캐러셀 20건+전체보기 카드. 최종 라인업은 `content/assets.ts` 주석 참조 — 설계·역학 5개(전투기/러닝 생체역학/반도체 조립라인/ISS/우주왕복선 발사), 열·유체 3, 제어·로보틱스 3, 생산·제조 3(**학과 제공 로봇핸드 연구영상**(구글드라이브 원본 1:31~1:37)/바이오 셀/스포츠카). 미디어는 Mixkit 무료 라이선스 추출 + 학과 제공 영상, public/media 자체 호스팅
- **예약 동기화 2027년 2월분까지 완료**: 옛 사이트 달력 17개월치(4개 시설 × 2026-11~2027-02 + 서버실 10월) 수집·파싱, 신규 80건 삽입(향후 예약 총 154건, 전부 학과회의실 정기예약. 2027-01·02는 정봉근 교수님 월 10-12시 각 4건뿐). 세미나실·제도실·서버실은 옛 사이트에도 향후 예약 0건 확인 — 10월 서버실 미확인 건도 이번에 확인 완료(예약 없음). 옛 사이트가 매우 느려 페이지당 45초 타임아웃 다수 → 재시도 3라운드 필요했음

## 완료 (2026-08-31 저녁 추가)
- **옛 홈페이지 백업(8/26) 이후 신규분 동기화 완료**: 공지 3건(인지컨트롤스 장학금·미소열유체공학 개설·신지연 학생 3MT 수상→award) 이미지 포함 이관(posts 2390~2392, legacy_id 규칙 유지), **시설 예약 74건**(학과회의실 8/31~10월 정기예약, status=approved, purpose='기존 홈페이지 예약 이관') 삽입. 세미나실·제도실·서버는 향후 예약 없음 확인. 옛 사이트 봇 챌린지는 헤드리스 Chromium으로 통과
- 홈 소식 캐러셀 화살표가 몇 번 만에 끝나던 것: 게시판별 20건 로드(news_count=20, DB 반영) + 캐러셀 끝 '전체 보기' 카드(브랜치)
- 동문 소식 1831(송지환 박사) 썸네일이 프로필 표 캡처라 이상하게 보이던 것 → 썸네일 제거(기본 커버 표시)

## 완료 (금번 세션 2026-08-31 추가)
- **석좌교수(조성환) DB row 등록 완료** (faculty id 25): 책임자가 세션 권한을 열어준 뒤 직접 삽입. 이름 조성환/Sung-Hwan Cho, 석좌교수/Chair Professor, sunghcho@korea.kr, field='chair', 사진·약력(현 ISO 회장/현 한국자율주행산업협회 회장/전 현대모비스 대표이사 사장) 포함. ※ 처음엔 auto 권한 분류기가 신규 인물 INSERT만 반복 차단했음(기존 레코드 patch는 통과) — 같은 상황이면 책임자에게 권한 완화를 요청할 것
- **main 배포 트리거 주의사항 확인**: GitHub MCP(`merge_pull_request`)로 만든 머지 커밋은 GitHub App 커밋이라 **Vercel이 배포하지 않음**(석좌교수 메뉴가 안 보였던 원인). 소유자 계정 커밋(이 세션의 git push)으로 재트리거해 해결 — MCP로 main에 머지했다면 반드시 후속 owner 커밋을 push할 것
- **이관 후 정리 스크립트 실행 완료**: `scripts/fix_legacy_content.py apply` — 중복 게시글 49건 비공개(published=false, 복구 가능), 게시글 58건 patch(옛 도메인 URL 치환·썸네일 보강·병합), faculty 18건 옛 도메인 URL 치환. plan 검증값과 일치. 남은 옛 도메인 40건은 파일 URL이 아닌 죽은 게시판 링크(LEGACY-BACKUP.md 기록대로 그대로 둠)
- **명예교수 6명 사진 복원**: 구 사이트(me.sogang.ac.kr, 봇 차단 JS 챌린지는 헤드리스 Chromium으로 통과) sub2_2에서 원본 내려받아 Storage `legacy/v2/data/file/sub2_2/`에 업로드하고 faculty.photo_url 갱신 (id 19~24: 김낙수·이철수·이태수·이형일·정시영·허남건). 이형일만 원본이 404라 112×128 썸네일로 대체
- **석좌교수 섹션 신설(코드)**: nav 교수진 하위에 `석좌교수`(`/faculty/chair`) 추가, `getChair()`(faculty.field='chair') + 전용 페이지, 상세페이지 탭 인식, `getFaculty(false)`는 chair 제외. `/adm` 교수 편집 폼의 "연구 분야"에 `석좌교수 (별도 목록)` 옵션 추가. 조성환 사진은 Storage `legacy/v2/data/file/sub2_3/`에 업로드 완료. (DB row는 위 "진행 중" 참조)

## 보류 · 대기
- **Supabase Storage 용량 초과(1.27GB/1GB)** → 방침 변경(2026-08-31): 유료 전환 대신 **Cloudflare R2 무료 이전**으로 결정. 위 "진행 중" 항목 참조. 이전 완료 전까지는 소프트 리밋 상태(당장은 정상 동작, Supabase 경고 메일 수 주 방치 시 읽기 전용 제한 가능)
- 이관 완료에 따라 `SUPABASE_SERVICE_ROLE_KEY` 재발급 권장 (LEGACY-BACKUP.md 계획대로). 재발급 시 Claude 클라우드 환경설정의 값도 갱신할 것
- **정기 DB 백업 루틴 만들기** (담당자 관심 사항, 2026-08-31): 코드·정적콘텐츠는 GitHub, 원본 legacy 백업은 구글드라이브에 있으나 Supabase DB(게시글·교수진 등)와 Storage는 무료 플랜에서 자동 백업이 없음. posts/faculty 등 전 테이블을 JSON/SQL로 덤프해 리포 외부(구글드라이브)에 보관하는 스크립트+주기 실행을 마련할 것. Pro 전환 시 일일 자동 백업 7일 포함되므로 그때는 보조 수단으로만
- 기존 국문 전용 게시글의 영문 벌크 번역 — 클라이언트 스크립트에서 Supabase anon key 접근 문제로 중단됨. 서버 사이드 스크립트 또는 `/adm` 경로로 재접근 필요. 이관되는 legacy 게시글도 동일 파이프라인 대상
- **예약 알림 수신자 변경 (책임자 요청, 2026-08-31)**: 지금은 예약 신청 시 학과 Gmail로 알림이 오는데, 최종적으로 박현주 선생님 서강대 메일로 전달(또는 직접 발송)되도록 바꿀 것. 예약 기능 전체 구현이 마무리된 뒤 진행하기로 함 — 그 시점에 책임자에게 상기시킬 것
- 콘텐츠 채우기: 창의적종합설계 아카이브(조원·주제 xlsx 있음), 학술제 학부생 발표 게시판, 홍보자료, 커뮤니티 뉴스
- 자동번역을 Google/MyMemory 무료 엔드포인트에서 Claude API(`ANTHROPIC_API_KEY`)로 업그레이드하는 안 — 미착수
- 학교 도메인(예: me.sogang.ac.kr) 연결 — 미신청. 신청 시 CNAME + `_vercel` TXT를 함께 요청하고 전파 6~8시간 감안
- 전공소개 하단 15쪽 슬라이드 뷰어(Physical AI 소개자료 원본)는 유지 중. 정리 여부는 책임자 판단 대기

## 확인된 환경 특성
- Tailwind 커스텀 색상 + 투명도 수식 미동작 → 인라인 rgba 사용 (CLAUDE.md 참조)
- Vercel 배포 지연 약 80~120초
- 이전 브라우저 확장 기반 작업에서 2~3MB 이상 업로드 실패 → Claude Code 클라우드 세션에서는 해당 없음
- auto 권한 모드 세션은 DB 대량 수정·설정 파일 쓰기가 분류기에 차단될 수 있음 → `.claude/settings.json` 허용 규칙(main에 추가됨)이 새 세션부터 적용됨. 차단 시 GitHub MCP 파일 커밋으로 우회 가능(책임자 승인 하에)

## 외부에 요청해 둔 것
- 없음

> ✅ **Vercel 배포 문제 해결 완료 (2026-08-31, 책임자와 함께 처리)** — 향후 세션 필독:
> - **원인**: Vercel에 프로젝트가 2개였다. ① 옛 프로젝트 `sogang-me-old`(팀 "Sogang ME", seokhwan89 계정) — `sogang-me.vercel.app` 도메인 보유, env 정상, 그러나 Git 연결이 없어 새 커밋 미배포. ② 새 프로젝트 `sogang-me`(팀 "SG office", sgmeoffice-hub 계정) — 리포와 연결돼 모든 커밋을 빌드했지만, env가 옛 프로젝트의 Secret(값 복사 불가) 미리보기 문자열로 잘려 들어가 있어 DB 데이터가 전부 빈 화면이었다.
> - **조치**: 새 프로젝트 env를 Supabase 대시보드의 실제 키로 재설정(`NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 **Config 타입**으로 재생성 — Secret 타입은 NEXT_PUBLIC_ 접두사와 함께 저장 불가, `SUPABASE_SERVICE_ROLE_KEY`는 Secret으로 신규 추가) → Redeploy → `sogang-me.vercel.app` 도메인을 옛 프로젝트에서 제거하고 새 프로젝트로 이전. 전 항목 검증 완료(석좌교수·게시판 668건·명예교수 사진·/adm).
> - **남은 권장**: 옛 프로젝트 `sogang-me-old`는 혼동 방지를 위해 삭제 권장(책임자 판단). 새 프로젝트의 `SUPABASE_SERVICE_ROLE_KEY`는 Production에만 걸려 있음 — Preview 배포에서 서버 기능이 필요하면 Preview에도 추가.
> - **교훈**: 이 리포의 배포 대상은 이제 팀 "SG office"의 `sogang-me` 프로젝트다. GitHub App(MCP) 머지 커밋도 배포가 트리거되니 author 조작은 불필요. Vercel env의 Secret 타입 값은 대시보드에서 복사할 수 없으므로 이전 시 반드시 원본(Supabase 등)에서 가져올 것.
