import { createClient } from '@/lib/supabase-server';
import { saveSettings, addAdmin } from '@/app/admin/actions';
export default async function Settings() {
  const sb = createClient();
  const { data } = await sb.from('site_settings').select('value').eq('key', 'home').maybeSingle();
  const { data: admins } = await sb.from('admins').select('email');
  const v = data?.value || {}; const sections: string[] = v.sections || ['hero', 'intro', 'news', 'programs', 'quicklinks', 'gallery'];
  const all = [['hero', '히어로 (영상 배너 + 4개 분야)'], ['intro', '연구 분야 4개 카드'], ['news', '학과 소식 (공지/연구성과/수상 3줄 카드뉴스)'], ['programs', '교육 프로그램 타일'], ['quicklinks', '자주 찾는 메뉴'], ['gallery', '갤러리']];
  return (<div>
    <h1 className="text-2xl font-bold">메인 페이지 · 설정</h1>
    <form action={saveSettings} className="mt-6 max-w-2xl space-y-5 bg-white border border-sg-line p-6">
      <div><p className="text-[13px] font-semibold">메인에 표시할 섹션</p><div className="mt-2 grid gap-2 sm:grid-cols-2 text-[13px]">{all.map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" name={`sec_${k}`} defaultChecked={sections.includes(k)} /> {l}</label>)}</div></div>
      <label className="block text-[13px]">섹션 순서 (쉼표로 구분: hero, intro, news, programs, quicklinks, gallery)<input name="order" defaultValue={sections.join(', ')} className="input mt-1 font-mono" /></label>
      <label className="block text-[13px]">메인 소식 줄당 카드 수 (4개씩 보이고 화살표로 넘김)<input name="news_count" type="number" min={4} max={16} defaultValue={v.news_count || 8} className="input mt-1 !w-24" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px]">히어로 배경 영상 URL (mp4)<input name="hero_video_url" defaultValue={v.hero_video_url || ''} className="input mt-1" placeholder="비우면 본교 캠퍼스 영상" /></label>
        <label className="block text-[13px]">히어로 대체 이미지 URL<input name="hero_poster_url" defaultValue={v.hero_poster_url || ''} className="input mt-1" placeholder="비우면 학과 대표 사진" /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-[13px]">히어로 문구 (한국어)<input name="tagline_ko" defaultValue={v.tagline_ko || ''} className="input mt-1" placeholder="비우면 기본 문구" /></label>
        <label className="block text-[13px]">Hero tagline (English)<input name="tagline_en" defaultValue={v.tagline_en || ''} className="input mt-1" /></label>
      </div>
      <p className="text-[12px] text-sg-steel">메인 노출 여부는 각 게시글 편집 화면의 "메인 페이지에 노출" 체크로 개별 제어됩니다.</p>
      <button className="btn-primary">저장</button>
    </form>
    <h2 className="mt-10 font-bold">관리자 계정</h2>
    <p className="text-[13px] text-sg-steel mt-1">Supabase → Authentication → Users 에서 계정을 만든 뒤, 아래에 같은 이메일을 등록하면 관리 권한이 부여됩니다.</p>
    <ul className="mt-3 text-[13px] space-y-1">{(admins || []).map((a: any) => <li key={a.email} className="font-mono">{a.email}</li>)}</ul>
    <form action={addAdmin} className="mt-3 flex gap-0 max-w-md"><input name="email" type="email" required placeholder="admin@sogang.ac.kr" className="input" /><button className="btn-primary !py-2">추가</button></form>
  </div>);
}
