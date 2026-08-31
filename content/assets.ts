/** Media reused from the existing department site / Sogang UI assets. Replace with department-owned uploads later (관리자 > 메인·설정).
 *  구 도메인(me.sogang.ac.kr) 만료에 대비해 원본을 Storage `legacy/`로 옮겨 참조한다 (2026-08-31). */
const media = 'https://pvdobbplxndsigatnamu.supabase.co/storage/v1/object/public/media/legacy';
export const assets = {
  campusVideo: 'https://www.sogang.ac.kr/banner/61_1.mp4',
  mainVisual: `${media}/v2/images/main/m_visual02.jpg`,
  ureca: `${media}/v2/images/main/ureca_bg.jpg`,
  entrance: `${media}/v2/images/main/m_entrance_bg.jpg`,
  industry: `${media}/v2/data/file/sub6_1/2750398411_e58GOPQj_EC9E85EC8381EAB8B0EC82ACEC82ACECA784_EAB980EB8F84EC9881.jpg`,
  research: `${media}/v2/data/file/sub6_1/2750398411_Ra4T8y7E_EC86A1ECA780ED9998_2.jpg`,
  festival: `${media}/v2/data/file/sub6_4/thumb-2750398411_wORSD0Ja_ED9599EC88A0ECA09C_ED9988ED8E98EC9DB4ECA780_EC82ACECA784001_900x636.jpg`,
};
/** Section hero images */
export const sectionHero: Record<string, string> = {
  about: assets.mainVisual, faculty: assets.research, undergraduate: assets.entrance, graduate: assets.ureca,
  industry: assets.industry, board: assets.festival, alumni: assets.mainVisual, default: assets.mainVisual,
};
