import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ReservationForm from '@/components/ReservationForm';
import { getReservations } from '@/lib/data';
import { facilities } from '@/lib/nav';
import { T, type Locale } from '@/lib/i18n';
export const revalidate = 30;

export default async function Reservation({ params, searchParams }: { params: { locale: Locale }; searchParams: { f?: string; y?: string; m?: string } }) {
  const l = params.locale; const ko = l === 'ko';
  const facility = facilities.some((x) => x.id === searchParams.f) ? searchParams.f! : 'seminar';
  const now = new Date();
  const y = Number(searchParams.y || now.getFullYear()); const m = Number(searchParams.m || now.getMonth() + 1);
  const rows = await getReservations(facility, y, m);
  const first = new Date(y, m - 1, 1).getDay(); const days = new Date(y, m, 0).getDate();
  const prev = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 }; const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  const byDay: Record<number, any[]> = {};
  rows.forEach((r: any) => { const d = Number(r.date.slice(8, 10)); (byDay[d] ||= []).push(r); });
  const fac = facilities.find((x) => x.id === facility)!;
  const dow = ko ? ['일', '월', '화', '수', '목', '금', '토'] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayStr = now.toISOString().slice(0, 10);
  return (<>
    <PageHero locale={l} section="board" current="reservation" />
    <div className="container-site py-12">
      <div className="flex flex-wrap gap-2 mb-6">
        {facilities.map((f) => <Link key={f.id} href={`/${l}/reservation?f=${f.id}&y=${y}&m=${m}`} className={`px-4 py-2 text-[13px] border ${f.id === facility ? 'bg-sg-ink text-white border-sg-ink' : 'border-sg-line hover:border-sg-ink'}`}>{ko ? f.ko : f.en}</Link>)}
      </div>
      <p className="text-[13px] text-sg-steel mb-6">{ko ? '* 예약은 아래 신청 양식으로 요청하시거나 학과사무실(02-705-8631)로 문의해 주세요. 승인된 예약만 캘린더에 표시됩니다.' : '* Request a reservation with the form below or contact the department office (+82-2-705-8631). Only approved reservations are shown.'}</p>
      <div className="border border-sg-line">
        <div className="flex items-center justify-between px-4 py-3 bg-sg-ink text-white">
          <Link href={`/${l}/reservation?f=${facility}&y=${prev.y}&m=${prev.m}`} className="font-mono px-2 hover:text-sg-red" aria-label="prev">‹</Link>
          <p className="font-semibold">{ko ? `${y}년 ${m}월` : new Date(y, m - 1).toLocaleString('en', { month: 'long', year: 'numeric' })} · {ko ? fac.ko : fac.en}</p>
          <Link href={`/${l}/reservation?f=${facility}&y=${next.y}&m=${next.m}`} className="font-mono px-2 hover:text-sg-red" aria-label="next">›</Link>
        </div>
        <div className="grid grid-cols-7 bg-sg-mist border-b border-sg-line">{dow.map((d, i) => <div key={d} className={`py-2 text-center font-mono text-[11px] tracking-wider ${i === 0 ? 'text-sg-red' : i === 6 ? 'text-blue-700' : 'text-sg-steel'}`}>{d}</div>)}</div>
        <div className="grid grid-cols-7 auto-rows-[minmax(88px,auto)]">
          {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} className="border-b border-r border-sg-line bg-sg-mist/40" />)}
          {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
            const ds = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            return (
              <div key={d} className={`border-b border-r border-sg-line p-1.5 ${ds === todayStr ? 'bg-sg-red/5' : ''}`}>
                <span className={`font-mono text-[12px] ${(first + d - 1) % 7 === 0 ? 'text-sg-red' : ''}`}>{d}</span>
                <ul className="mt-1 space-y-1">{(byDay[d] || []).map((r: any) => (
                  <li key={r.id} className={`text-[11px] leading-tight px-1 py-0.5 border-l-2 ${r.status === 'approved' ? 'border-sg-red bg-white' : 'border-sg-steel bg-sg-mist text-sg-steel'}`} title={r.purpose || ''}>
                    <span className="font-mono">{r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}</span> {r.user_name}{r.status !== 'approved' && ` (${T(l, 'pending')})`}
                  </li>
                ))}</ul>
              </div>
            );
          })}
        </div>
      </div>
      <h2 className="h-section mt-14 mb-6">{T(l, 'reserve')}</h2>
      <ReservationForm locale={l} facility={facility} />
    </div>
  </>);
}
