import { createClient } from '@/lib/supabase-server';
import { setReservation, addReservation } from '@/app/admin/actions';
import { facilities } from '@/lib/nav';
export default async function ReservationsAdmin({ searchParams }: { searchParams: { f?: string } }) {
  const sb = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: pending } = await sb.from('reservations').select('*').eq('status', 'pending').order('date');
  let q = sb.from('reservations').select('*').neq('status', 'pending').gte('date', today).order('date').order('start_time').limit(200);
  if (searchParams.f) q = q.eq('facility', searchParams.f);
  const { data: upcoming } = await q;
  const fac = (id: string) => facilities.find((f) => f.id === id)?.ko || id;
  const Row = ({ r }: { r: any }) => (
    <tr className="border-t border-sg-line">
      <td className="p-3">{fac(r.facility)}</td><td className="p-3 font-mono text-[12px]">{r.date} {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}</td>
      <td className="p-3">{r.user_name}<span className="block text-[11px] text-sg-steel">{r.contact} {r.purpose && `· ${r.purpose}`}</span></td>
      <td className="p-3"><div className="flex gap-1">
        {r.status !== 'approved' && <form action={setReservation}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><button className="px-2 py-1 text-[12px] bg-sg-ink text-white">승인</button></form>}
        {r.status !== 'rejected' && <form action={setReservation}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className="px-2 py-1 text-[12px] border border-sg-line bg-white">거절</button></form>}
        <form action={setReservation}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="delete" /><button className="px-2 py-1 text-[12px] text-sg-red">삭제</button></form>
      </div></td>
    </tr>);
  return (<div>
    <h1 className="text-2xl font-bold">시설 예약 관리</h1>
    <h2 className="mt-6 font-bold">승인 대기 <span className="font-mono text-sg-red">{pending?.length || 0}</span></h2>
    <table className="mt-2 w-full text-[13px] bg-white border border-sg-line"><tbody>{(pending || []).map((r: any) => <Row key={r.id} r={r} />)}{!pending?.length && <tr><td className="p-4 text-sg-steel">대기 중인 신청이 없습니다.</td></tr>}</tbody></table>
    <h2 className="mt-10 font-bold">예약 직접 등록 (즉시 확정)</h2>
    <form action={addReservation} className="mt-2 grid gap-2 sm:grid-cols-6 bg-white border border-sg-line p-4 text-[13px]">
      <select name="facility" className="input">{facilities.map((f) => <option key={f.id} value={f.id}>{f.ko}</option>)}</select>
      <input name="date" type="date" required className="input" /><input name="start_time" type="time" required className="input" /><input name="end_time" type="time" required className="input" />
      <input name="user_name" required placeholder="이름" className="input" /><input name="purpose" placeholder="목적" className="input" />
      <button className="btn-primary sm:col-span-6 justify-center">등록</button>
    </form>
    <h2 className="mt-10 font-bold">예정된 예약</h2>
    <div className="mt-2 flex gap-1 flex-wrap">{[{ id: '', ko: '전체' }, ...facilities].map((f) => <a key={f.id} href={`?f=${f.id}`} className={`px-3 py-1 text-[12px] border ${(searchParams.f || '') === f.id ? 'bg-sg-ink text-white' : 'bg-white border-sg-line'}`}>{f.ko}</a>)}</div>
    <table className="mt-2 w-full text-[13px] bg-white border border-sg-line"><tbody>{(upcoming || []).map((r: any) => <Row key={r.id} r={r} />)}</tbody></table>
  </div>);
}
