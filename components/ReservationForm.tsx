'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { facilities } from '@/lib/nav';
import type { Locale } from '@/lib/i18n';

export default function ReservationForm({ locale, facility, date }: { locale: Locale; facility: string; date?: string }) {
  const ko = locale === 'ko';
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState('saving');
    const fd = new FormData(e.currentTarget);
    const row = Object.fromEntries(fd.entries()) as any;
    if (row.start_time >= row.end_time) { setMsg(ko ? '종료 시간이 시작 시간보다 늦어야 합니다.' : 'End time must be after start time.'); setState('error'); return; }
    const sb = createClient();
    const { error } = await sb.from('reservations').insert({ ...row, status: 'pending' });
    if (error) { setMsg(error.message); setState('error'); } else setState('done');
  }
  if (state === 'done') return <div className="border border-sg-red p-6 bg-sg-mist"><p className="font-semibold">{ko ? '예약 신청이 접수되었습니다.' : 'Your request has been received.'}</p><p className="text-[14px] text-sg-steel mt-1">{ko ? '학과사무실 승인 후 캘린더에 표시됩니다. (02-705-8631)' : 'It will appear on the calendar once the department office approves it. (+82-2-705-8631)'}</p></div>;
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 border border-sg-line p-6">
      <label className="text-[13px]"><span className="eyebrow">{ko ? '시설' : 'Facility'}</span>
        <select name="facility" defaultValue={facility} className="input mt-1">{facilities.map((f) => <option key={f.id} value={f.id}>{ko ? f.ko : f.en}</option>)}</select></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '날짜' : 'Date'}</span><input name="date" type="date" required defaultValue={date} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '시작' : 'Start'}</span><input name="start_time" type="time" required step={1800} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '종료' : 'End'}</span><input name="end_time" type="time" required step={1800} className="input mt-1" /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '이름' : 'Name'}</span><input name="user_name" required className="input mt-1" placeholder={ko ? '홍길동 (연구실명)' : 'Name (lab)'} /></label>
      <label className="text-[13px]"><span className="eyebrow">{ko ? '연락처' : 'Contact'}</span><input name="contact" required className="input mt-1" placeholder={ko ? '이메일 또는 전화' : 'Email or phone'} /></label>
      <label className="text-[13px] sm:col-span-2"><span className="eyebrow">{ko ? '사용 목적' : 'Purpose'}</span><input name="purpose" className="input mt-1" /></label>
      <input type="hidden" name="affiliation" value="" />
      <div className="sm:col-span-2 flex items-center gap-4">
        <button disabled={state === 'saving'} className="btn-primary">{state === 'saving' ? '…' : ko ? '예약 신청' : 'Request reservation'}</button>
        {state === 'error' && <p className="text-[13px] text-sg-red">{msg}</p>}
      </div>
    </form>
  );
}
