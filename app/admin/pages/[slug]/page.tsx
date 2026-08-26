import { createClient } from '@/lib/supabase-server';
import { savePage, resetPage } from '@/app/admin/actions';
import HtmlEditor from '@/components/admin/HtmlEditor';
import TranslateButton from '@/components/admin/TranslateButton';
import { staticPages } from '@/content';
import { notFound } from 'next/navigation';

export default async function EditPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug); const builtin = staticPages[slug]; if (!builtin) notFound();
  const sb = createClient(); const { data } = await sb.from('pages').select('*').eq('slug', slug).maybeSingle();
  return (<div>
    <div className="flex items-center justify-between"><h1 className="text-2xl font-bold font-mono">/{slug}</h1>
      {data && <form action={resetPage}><input type="hidden" name="slug" value={slug} /><button className="text-[13px] text-sg-red underline">기본 내용으로 되돌리기</button></form>}</div>
    <form action={savePage} className="mt-6 space-y-5 max-w-5xl">
      <input type="hidden" name="slug" value={slug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[13px]">페이지 제목 (한국어, 비우면 메뉴명)<input name="title_ko" defaultValue={data?.title_ko || ''} className="input mt-1" /></label>
        <label className="text-[13px]">Title (English)<input name="title_en" defaultValue={data?.title_en || ''} className="input mt-1" /></label>
      </div>
      <div><p className="text-[13px] mb-1">본문 (한국어, HTML)</p><HtmlEditor name="content_ko" defaultValue={data?.content_ko || builtin.ko} folder="pages" rows={24} /></div>
      <div><p className="text-[13px] mb-1">Content (English)</p><HtmlEditor name="content_en" defaultValue={data?.content_en || builtin.en} folder="pages" rows={18} /></div>
      <div className="flex flex-wrap gap-4 items-center text-[13px]"><TranslateButton pairs={[['content_ko', 'content_en']]} /><label className="flex items-center gap-2"><input type="checkbox" name="auto_translate" /> 저장 시 영문이 비어있으면 자동 번역</label></div>
      <button className="btn-primary">저장</button>
    </form>
  </div>);
}
