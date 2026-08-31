/** Media reused from the existing department site / Sogang UI assets. Replace with department-owned uploads later (관리자 > 메인·설정).
 *  구 도메인(me.sogang.ac.kr) 만료에 대비해 원본을 Storage `legacy/`로 옮겨 참조한다 (2026-08-31).
 *  /media/ 아래 파일은 Mixkit 무료 라이선스(상업 이용·수정 가능, 출처표기 불요) 영상에서 추출·인코딩한 것:
 *  hero-design=mixkit #22031(제트엔진), hero-thermal=#154(잉크 유동), hero-control=#47257(산업 로봇),
 *  hero-manufacturing=#47291(용접), page-entrance=#5900(캠퍼스), page-research=#17456(실험 튜브),
 *  page-festival=#48166(강의실 팀활동), page-industry=#47257, page-ureca=#23618(연구실 현미경). */
const media = 'https://pvdobbplxndsigatnamu.supabase.co/storage/v1/object/public/media/legacy';
export const assets = {
  campusVideo: 'https://www.sogang.ac.kr/banner/61_1.mp4',
  mainVisual: `${media}/v2/images/main/m_visual02.jpg`,
  ureca: '/media/pages/page-ureca.jpg',
  entrance: '/media/pages/page-entrance.jpg',
  industry: '/media/pages/page-industry.jpg',
  research: '/media/pages/page-research.jpg',
  festival: '/media/pages/page-festival.jpg',
};
/** 홈 히어로 배경: 4개 기초 분야 대표 영상 (공식 순서: 설계·역학 / 열·유체 / 제어·로보틱스 / 생산·제조) */
export const heroFieldVideos = [
  { src: '/media/hero/hero-design.mp4', poster: '/media/hero/hero-design.jpg' },
  { src: '/media/hero/hero-thermal.mp4', poster: '/media/hero/hero-thermal.jpg' },
  { src: '/media/hero/hero-control.mp4', poster: '/media/hero/hero-control.jpg' },
  { src: '/media/hero/hero-manufacturing.mp4', poster: '/media/hero/hero-manufacturing.jpg' },
];
/** Section hero images */
export const sectionHero: Record<string, string> = {
  about: assets.mainVisual, faculty: assets.research, undergraduate: assets.entrance, graduate: assets.ureca,
  industry: assets.industry, board: assets.festival, alumni: assets.mainVisual, default: assets.mainVisual,
};
