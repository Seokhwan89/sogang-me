import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { adminBase } from '@/lib/admin';
export default async function FacultyAdmin() {
  const sb = createClient(); const b = adminBase();
  const { data } = await sb.from('faculty').select('id,name_ko,name_en,lab_ko,office,field,is_emeritus,published,sort_order').order('is_emeritus').order('sort_order');
  return (<div>
    <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">교수진 관리</h1><Link href={`${b}/faculty/new`} className="btn-primary">+ 교수 추가</Link></div>
    <table className="mt-6 w-full text-[13px] bg-white border border-sg-line">
      <thead className="bg-sg-mist text-left font-mono text-[11px] uppercase tracking-wider text-sg-steel"><tr><th className="p-3 w-16">순서</th><th className="p-3">이름</th><th className="p-3">연구실</th><th className="p-3 w-32">위치</th><th className="p-3 w-24">분야</th><th className="p-3 w-24">구분</th></tr></thead>
      <tbody>{(data || []).map((f: any) => <tr key={f.id} className="border-t border-sg-line hover:bg-sg-mist/60">
        <td className="p-3 font-mono text-sg-steel">{f.sort_order}</td>
        <td className="p-3"><Link href={`${b}/faculty/${f.id}`} className="font-medium hover:text-sg-red">{f.name_ko}</Link> <span className="text-sg-steel">{f.name_en}</span>{!f.published && <span className="ml-2 text-[11px] text-sg-steel">(비공개)</span>}</td>
        <td className="p-3">{f.lab_ko}</td><td className="p-3 text-sg-steel">{f.office}</td><td className="p-3 font-mono text-[11px]">{f.field}</td><td className="p-3">{f.is_emeritus ? '명예교수' : '전임교수'}</td></tr>)}</tbody>
    </table>
  </div>);
}
