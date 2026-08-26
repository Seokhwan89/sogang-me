import StaticPage from '@/components/StaticPage';
import AcademicCalendar from '@/components/Calendar';
import { researchAreas, researchGroups } from '@/content/pages-grad';
import type { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 300;

export default function Grad({ params }: { params: { locale: Locale; slug: string } }) {
  const { locale: l, slug } = params; const ko = l === 'ko';
  if (slug === 'calendar') return <StaticPage locale={l} section="graduate" slug="calendar"><AcademicCalendar locale={l} /></StaticPage>;
  if (slug === 'areas') return (
    <StaticPage locale={l} section="graduate" slug="areas">
      <div className="space-y-16">
        {researchAreas.map((a) => (
          <section key={a.id} id={a.id} className="scroll-mt-32">
            <h2 className="text-2xl font-bold tracking-tight border-t-2 border-sg-ink pt-5">{ko ? a.ko : a.en}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#2a2d33]">{ko ? a.descKo : a.descEn}</p>
            {a.courses && ko && <p className="mt-2 text-[13px] text-sg-steel"><span className="font-semibold text-sg-ink">교과목:</span> {a.courses}</p>}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead><tr className="text-left text-[12px] font-mono uppercase tracking-wider text-sg-steel border-b border-sg-line">
                  <th className="py-2 pr-3">{ko ? '연구실' : 'Laboratory'}</th><th className="py-2 pr-3">{ko ? '지도교수' : 'Advisor'}</th><th className="py-2 pr-3">{ko ? '위치' : 'Room'}</th><th className="py-2">{ko ? '전화' : 'Phone'}</th></tr></thead>
                <tbody>
                  {a.labs.map((lb) => (
                    <tr key={lb.ko} className="border-b border-sg-line align-top">
                      <td className="py-3 pr-3">
                        {lb.url ? <a href={lb.url} target="_blank" rel="noreferrer" className="font-semibold hover:text-sg-red">{ko ? lb.ko : lb.en}</a> : <span className="font-semibold">{ko ? lb.ko : lb.en}</span>}
                        <span className="block text-[12px] text-sg-steel">{ko ? lb.en : lb.ko}</span>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">{ko ? lb.prof : lb.profEn}</td>
                      <td className="py-3 pr-3 font-mono text-[13px]">{lb.room}</td>
                      <td className="py-3 font-mono text-[13px]">02-{lb.tel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </StaticPage>
  );
  if (slug === 'groups') {
    const labOf: Record<string, any> = {};
    researchAreas.forEach((a) => a.labs.forEach((lb) => { labOf[lb.prof] = lb; }));
    return (
      <StaticPage locale={l} section="graduate" slug="groups">
        <p className="prose-sg">{ko ? '서강대학교 기계공학과는 설계 및 재료역학, 열·유체 및 에너지, 제어·진동·로보틱스, 생산공학 등 4개의 기초전공분야를 바탕으로 다음과 같은 융합 및 응용연구를 수행하고 있습니다.' : 'Building on four foundational areas — design & mechanics, thermal-fluids & energy, control-vibration-robotics and manufacturing — the department conducts the following convergence and applied research.'}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {researchGroups.map((g) => (
            <section key={g.ko} className="card p-6">
              <h2 className="text-lg font-bold">{ko ? g.ko : g.en}</h2>
              <ul className="mt-4 space-y-2">
                {g.profs.map((p) => { const lb = labOf[p]; return (
                  <li key={p} className="text-[14px] flex flex-wrap gap-x-2 items-baseline">
                    <span className="font-semibold">{ko ? p : lb?.profEn || p}</span>
                    {lb && <span className="text-sg-steel">{ko ? lb.ko : lb.en}</span>}
                    {lb && <span className="font-mono text-[11px] text-sg-steel">{lb.room}</span>}
                  </li>
                ); })}
              </ul>
            </section>
          ))}
        </div>
      </StaticPage>
    );
  }
  if (!['admission', 'curriculum'].includes(slug)) notFound();
  return <StaticPage locale={l} section="graduate" slug={slug} />;
}
