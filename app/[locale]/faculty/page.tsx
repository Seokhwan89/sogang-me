import PageHero from '@/components/PageHero';
import FacultyCard from '@/components/FacultyCard';
import { getFaculty } from '@/lib/data';
import { areas } from '@/content/areas';
import type { Locale } from '@/lib/i18n';
export const revalidate = 300;

export default async function Faculty({ params, searchParams }: { params: { locale: Locale }; searchParams: { field?: string } }) {
  const l = params.locale; const ko = l === 'ko';
  const all = await getFaculty(false);
  const field = searchParams.field || '';
  const list = field ? all.filter((f: any) => f.field === field) : all;
  return (<>
    <PageHero locale={l} section="faculty" current="professors" />
    <div className="container-site py-12">
      <div className="flex flex-wrap gap-2 mb-8">
        <a href={`/${l}/faculty`} className={`px-4 py-2 text-[13px] border ${!field ? 'bg-sg-ink text-white border-sg-ink' : 'border-sg-line hover:border-sg-ink'}`}>{ko ? '전체' : 'All'} <span className="font-mono text-[11px] opacity-60">{all.length}</span></a>
        {areas.map((a) => (
          <a key={a.id} href={`/${l}/faculty?field=${a.id}`} className={`px-4 py-2 text-[13px] border ${field === a.id ? 'bg-sg-ink text-white border-sg-ink' : 'border-sg-line hover:border-sg-ink'}`}>{ko ? a.ko : a.en}</a>
        ))}
      </div>
      {list.length === 0 ? <p className="text-sg-steel">{ko ? '교수진 정보가 아직 등록되지 않았습니다. 관리자 페이지에서 supabase/seed_faculty.sql 을 실행해 주세요.' : 'No faculty records yet.'}</p> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((f: any) => <FacultyCard key={f.id} f={f} locale={l} />)}</div>}
    </div>
  </>);
}
