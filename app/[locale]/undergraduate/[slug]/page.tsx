import Link from 'next/link';
import StaticPage from '@/components/StaticPage';
import AcademicCalendar from '@/components/Calendar';
import UrecaForm from '@/components/UrecaForm';
import SlideDeck from '@/components/SlideDeck';
import Reveal from '@/components/Reveal';
import { emblemOf } from '@/components/FieldEmblems';
import { majorFields, introCourse, introSlides } from '@/content/majors';
import { getFaculty } from '@/lib/data';
import type { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 300;
const slugs = ['admission', 'majors', 'curriculum', 'competency', 'calendar', 'activities', 'ureca'];

export default async function UG({ params }: { params: { locale: Locale; slug: string } }) {
  const { locale: l, slug } = params; const ko = l === 'ko';
  if (!slugs.includes(slug)) notFound();
  if (slug === 'calendar') return <StaticPage locale={l} section="undergraduate" slug="calendar"><AcademicCalendar locale={l} /></StaticPage>;
  if (slug === 'ureca') {
    const labs = (await getFaculty(false)).filter((f: any) => f.lab_ko);
    return (
      <StaticPage locale={l} section="undergraduate" slug="ureca">
        <div className="mt-12 border-t-2 border-sg-ink pt-8">
          <p className="eyebrow">URECA Intern</p>
          <h2 className="h-sub mt-2 mb-2">{ko ? 'URECA 인턴 지원하기' : 'Apply for URECA Intern'}</h2>
          <p className="text-[15px] text-sg-gray11 mb-6">{ko ? '기계공학과 2~4학년 학생은 아래 양식으로 지원할 수 있습니다. 지원 기간(봄학기·여름방학·가을학기·겨울방학)을 선택하고 지망 연구실을 1·2·3순위로 표시하세요. 1지망부터 순서대로 해당 교수님께서 선발 여부를 결정하며, 선발되면 학과사무실에 서약서를 제출한 후 인턴이 시작됩니다.' : 'ME students in years 2–4 may apply below. Choose the term and rank up to three labs. Professors decide in order of preference; selected students submit a pledge to the department office before starting.'}</p>
          <UrecaForm locale={l} labs={labs as any} />
        </div>
      </StaticPage>
    );
  }
  if (slug === 'majors') return (
    <StaticPage locale={l} section="undergraduate" slug="majors">
      <div className="-mt-2">
        <p className="eyebrow">{ko ? '전공소개' : 'Major Fields'}</p>
        <h2 className="h-section mt-2">{ko ? '기계공학의 네 가지 기초 분야' : 'Four foundational fields of mechanical engineering'}</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-sg-gray11 max-w-3xl">{ko ? '기계공학은 설계·역학, 열·유체, 제어·진동·로보틱스, 생산·제조라는 네 기둥 위에 서 있습니다. 각 분야는 고유한 학문 체계를 바탕으로 자동차, 항공우주, 에너지, 반도체, 바이오 등 모든 산업을 떠받치며, 네 분야가 만나 로봇과 Physical AI 같은 융합 영역으로 확장됩니다.' : 'Mechanical engineering stands on four pillars — design and mechanics, thermal and fluids, control-vibration-robotics, and manufacturing. Each is a discipline in its own right, underpinning every industry from automotive and aerospace to energy, semiconductors and bio, and together they converge into fields such as robotics and Physical AI.'}</p>
        <div className="mt-8 bg-sg-ink text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
          <p className="font-brand text-[1.25rem] md:text-[1.45rem] leading-tight shrink-0">Physical AI</p>
          <p className="text-[14.5px] md:text-[15px] leading-relaxed text-white/85 break-keep">{ko ? 'Physical AI는 디지털 지능을 물리적 실체로 구현하는 종합 시스템 기술입니다. 아래 네 기초 분야의 깊이가 모여 실제 세계에서 작동하는 지능형 기계를 완성합니다.' : 'Physical AI embodies digital intelligence in the physical world. The depth of the four foundational fields below comes together to complete intelligent machines that work in reality.'}</p>
        </div>
      </div>
      <div className="mt-16 space-y-10">
        {majorFields.map((f, i) => { const E = emblemOf[f.id]; return (
          <Reveal key={f.id}>
            <section id={f.id} className="scroll-mt-40 grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 border-t border-sg-line pt-8">
              <div><div className="w-full max-w-[220px] text-sg-cardinal"><E className="w-full h-auto" /></div><p className="mt-2 text-[13px] font-semibold text-sg-gray9">{String(i + 1).padStart(2, '0')}{ko ? ` · ${f.en}` : ''}</p></div>
              <div>
                <p className="eyebrow">{ko ? f.tagKo : f.tagEn}</p>
                <h3 className="font-brand text-[1.7rem] md:text-[2.1rem] mt-1 leading-tight">{ko ? f.ko : f.en}</h3>
                {ko && <p className="mt-2 text-[15px] font-semibold text-sg-gray11">{f.summaryKo}</p>}
                <p className="mt-4 text-[16px] leading-[1.85]">{ko ? f.bodyKo : f.bodyEn}</p>
                <div className="mt-5"><p className="text-[12.5px] font-semibold tracking-wider text-sg-gray9 uppercase mb-2">{ko ? '관련 교과목' : 'Related courses'}</p><ul className="flex flex-wrap gap-2">{(ko ? f.courses : (f as any).coursesEn || f.courses).map((c: string) => <li key={c} className="text-[13px] px-3 py-1 bg-sg-mist border border-sg-line">{c}</li>)}</ul></div>
              </div>
            </section>
          </Reveal>
        ); })}
      </div>
      <section className="mt-16 bg-sg-mist border-l-4 border-sg-cardinal p-6 md:p-8">
        <p className="eyebrow">{ko ? '1학년·자유전공학부 학생 추천 교과목' : 'Recommended for first-year & liberal-major students'}</p>
        <h3 className="text-[20px] font-bold mt-2">{ko ? introCourse.ko.name : introCourse.en.name} <span className="text-[13px] font-normal text-sg-gray9">MEE1006</span></h3>
        <p className="mt-3 text-[15.5px] leading-relaxed">{ko ? introCourse.ko.desc : introCourse.en.desc}</p>
      </section>
      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div><p className="eyebrow">{ko ? '전공소개 자료' : 'Introduction deck'}</p><h3 className="h-sub mt-1">{ko ? '자유전공학부 학생을 위한 전공 안내' : 'Major guide for liberal-major students'}</h3></div>
          <Link href={`/${l}/board/promo`} className="text-[14px] font-semibold text-sg-cardinal hover:underline">{ko ? '전공 홍보자료 게시판 →' : 'All intro materials →'}</Link>
        </div>
        <SlideDeck slides={introSlides} download="/docs/sogang-me-physical-ai-intro.pdf" label={ko ? '서강대 기계공학과 전공소개 (Physical AI)' : 'Sogang ME · Physical AI'} />
      </section>
    </StaticPage>
  );
  return <StaticPage locale={l} section="undergraduate" slug={slug} />;
}
