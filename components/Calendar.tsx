import { calendar2026 } from '@/content/pages-ug';
import type { Locale } from '@/lib/i18n';

export default function AcademicCalendar({ locale }: { locale: Locale }) {
  const byMonth: Record<string, typeof calendar2026> = {};
  for (const e of calendar2026) { const m = e.d.slice(0, 7); (byMonth[m] ||= []).push(e); }
  const months = Object.keys(byMonth);
  return (
    <div>
      <p className="text-sg-steel text-[14px] mb-8">{locale === 'en' ? '2026 academic year (March 2026 – February 2027). Shared by undergraduate and graduate programs.' : '2026학년도 (2026년 3월 ~ 2027년 2월). 학부·대학원 공통 일정입니다.'}</p>
      <div className="grid gap-6 md:grid-cols-2">
        {months.map((m) => (
          <section key={m} className="border-t-2 border-sg-ink pt-4">
            <h3 className="font-mono text-sm tracking-wider text-sg-red">{m.replace('-', '.')}</h3>
            <ul className="mt-3 divide-y divide-sg-line">
              {byMonth[m].map((e, i) => (
                <li key={i} className="py-2.5 grid grid-cols-[132px_1fr] gap-3 text-[14px]">
                  <span className="font-mono text-[12px] text-sg-steel">{e.d.slice(5).replace(' ~ ', '–').replace(/-/g, '.')}</span>
                  <span>{locale === 'en' ? e.en : e.ko}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
