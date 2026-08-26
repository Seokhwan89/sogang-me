import { createClient } from '@/lib/supabase-server';
import { saveFaculty, deleteFaculty } from '@/app/admin/actions';
import HtmlEditor from '@/components/admin/HtmlEditor';
import TranslateButton from '@/components/admin/TranslateButton';
import PhotoField from '@/components/admin/PhotoField';
import { areas } from '@/content/areas';
import { notFound } from 'next/navigation';

export default async function EditFaculty({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new'; let f: any = null;
  if (!isNew) { const sb = createClient(); const { data } = await sb.from('faculty').select('*').eq('id', Number(params.id)).single(); if (!data) notFound(); f = data; }
  const I = ({ n, l, v, ph }: { n: string; l: string; v?: string; ph?: string }) => <label className="block text-[13px]">{l}<input name={n} defaultValue={v || ''} placeholder={ph} className="input mt-1" /></label>;
  return (<div>
    <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{isNew ? '교수 추가' : `${f.name_ko} 교수`}</h1>
      {f && <form action={deleteFaculty}><input type="hidden" name="id" value={f.id} /><button className="text-[13px] text-sg-red underline">삭제</button></form>}</div>
    <form action={saveFaculty} className="mt-6 max-w-4xl space-y-5">
      {f && <input type="hidden" name="id" value={f.id} />}
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <PhotoField defaultValue={f?.photo_url} />
        <div className="grid gap-3 sm:grid-cols-2">
          <I n="name_ko" l="이름 (한국어) *" v={f?.name_ko} /><I n="name_en" l="Name (English)" v={f?.name_en} ph="Gildong Hong" />
          <I n="title_ko" l="직함" v={f?.title_ko || '교수'} /><I n="title_en" l="Title" v={f?.title_en || 'Professor'} />
          <I n="email" l="이메일" v={f?.email} /><I n="tel" l="전화" v={f?.tel} ph="02-705-0000" />
          <I n="lab_ko" l="연구실명 (한국어)" v={f?.lab_ko} /><I n="lab_en" l="Laboratory (English)" v={f?.lab_en} />
          <I n="lab_url" l="연구실 홈페이지" v={f?.lab_url} ph="https://" /><I n="office" l="위치" v={f?.office} ph="리치과학관(R) 618호" />
          <label className="block text-[13px]">연구 분야<select name="field" defaultValue={f?.field || ''} className="input mt-1"><option value="">—</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.ko}</option>)}</select></label>
          <I n="sort_order" l="정렬 순서 (작을수록 앞)" v={String(f?.sort_order ?? 100)} />
        </div>
      </div>
      <div><p className="text-[13px] mb-1">연구분야 소개 (한국어, HTML)</p><HtmlEditor name="research_ko" defaultValue={f?.research_ko || ''} folder="faculty" rows={8} /></div>
      <div><p className="text-[13px] mb-1">Research (English)</p><HtmlEditor name="research_en" defaultValue={f?.research_en || ''} folder="faculty" rows={6} /></div>
      <div><p className="text-[13px] mb-1">약력 (한국어, HTML)</p><HtmlEditor name="bio_ko" defaultValue={f?.bio_ko || ''} folder="faculty" rows={8} /></div>
      <div><p className="text-[13px] mb-1">Biography (English)</p><HtmlEditor name="bio_en" defaultValue={f?.bio_en || ''} folder="faculty" rows={6} /></div>
      <div className="flex flex-wrap gap-4 items-center text-[13px]">
        <TranslateButton pairs={[['lab_ko', 'lab_en'], ['research_ko', 'research_en'], ['bio_ko', 'bio_en']]} />
        <label className="flex items-center gap-2"><input type="checkbox" name="auto_translate" defaultChecked /> 저장 시 비어있는 영문 자동 번역</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="is_emeritus" defaultChecked={f?.is_emeritus} /> 명예교수</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={f ? f.published : true} /> 공개</label>
      </div>
      <button className="btn-primary">저장</button>
    </form>
  </div>);
}
