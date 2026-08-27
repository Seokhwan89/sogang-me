'use client';
import { useState } from 'react';
import { facilities } from '@/lib/nav';
import type { Locale } from '@/lib/i18n';

export default function ReservationForm({ locale, facility, date }: { locale: Locale; facility: string; date?: string }) {
  const ko = locale === 'ko';
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState('saving');
    const row = Object.fromEntries(new FormData(e.currentTarget).entries()) as any;
    if (row.start_time >= row.end_time) { setMsg(ko ? '종료 시간이 시작 시간보다 늦어야 합니다.' : 'End time must be after start time.'); setState('error'); return; }
    const r = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
    if (!r.ok) { setMsg((await r.json()).error || 'error'); setState('error'); } else setState('done');
  }
  if (state === 'done') return <div className="border-l-4 border-sg-cardinal bg-sg-mist p-6"><p className="font-bold text-[17px]">{ko ? '예약 신청이 접수되었습니다.' : 'Your request has been received.'}</p><p className="text-[14.5px] text-sg-gray11 mt-1">{ko ? '학과사무실 확인 후 승인되면 캘린더에 표시됩니다. (02-705-8631)' : 'It will appear on the calendar once approved by the department office. (+82-2-705-8631)'}</p></div>;
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 border border-sg-line p-6 bg-white">
      <label className="text-[13px]"><span className="eyebrow">{ko ? '시설' : 'Facility'}</span><select name="facility" defaultValue={facility} className="input mt-1">{facilities.map((f) => <option key={f.id} value={f.id}>{ko ? f.ko : f.en}</option>)}</select></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '날짜' : 'Date'}</span><input name="date" type="date" required defaultValue={date} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '시작' : 'Start'}</span><input name="start_time" type="time" required step={1800} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '종료' : 'End'}</span><input name="end_time" type="time" required step={1800} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '이름 (소속)' : 'Name (lab)'}</span><input name="user_name" required className="input mt-1" placeholder={ko ? '홍길동 (OO연구실)' : 'Name (lab)'} /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '연락처' : 'Contact'}</span><input name="contact" required className="input mt-1" placeholder={ko ? '이메일 또는 전화' : 'Email or phone'} /></label>
      <label className="text-[13px] sm:col-span-2"><span className="eyebrow">{ko ? '사용 목적' : 'Purpose'}</span><input name="purpose" className="input mt-1" /></label>
      <div className="sm:col-span-2 flex items-center gap-4">
        <button disabled={state === 'saving'} className="btn-primary">{state === 'saving' ? '…' : ko ? '예약 신청' : 'Request reservation'}</button>
        {state === 'error' && <p className="text-[13px] text-sg-cardinal">{msg}</p>}
      </div>
    </form>
  );
}
