import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';
import { notifyAdmin } from '@/lib/notify';
import { facilities } from '@/lib/nav';

const today = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // KST 기준 오늘

/** 겹치는 예약 조회 (승인 완료 + 승인 대기 모두 확인). 시작 < 상대 종료 && 종료 > 상대 시작 이면 충돌. */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const facility = u.searchParams.get('facility') || '';
  const date = u.searchParams.get('date') || '';
  const start = u.searchParams.get('start') || '';
  const end = u.searchParams.get('end') || '';
  if (!facility || !date || !start || !end) return NextResponse.json({ conflicts: [] });
  const sb = createPublicClient();
  const { data } = await sb.from('reservations').select('id,user_name,start_time,end_time,status')
    .eq('facility', facility).eq('date', date).neq('status', 'rejected').lt('start_time', end).gt('end_time', start);
  return NextResponse.json({ conflicts: data || [] });
}

export async function POST(req: Request) {
  const b = await req.json();
  const row = {
    facility: String(b.facility || ''), date: String(b.date || ''), start_time: String(b.start_time || ''), end_time: String(b.end_time || ''),
    user_name: String(b.user_name || '').slice(0, 80), contact: String(b.contact || '').slice(0, 120),
    purpose: String(b.purpose || '').slice(0, 300), affiliation: String(b.affiliation || '').slice(0, 120), status: 'pending',
  };
  if (!row.facility || !row.date || !row.start_time || !row.end_time || !row.user_name || !row.contact)
    return NextResponse.json({ error: '필수 항목이 비어 있습니다.' }, { status: 400 });
  if (row.start_time >= row.end_time) return NextResponse.json({ error: '종료 시간이 시작 시간보다 늦어야 합니다.' }, { status: 400 });
  if (row.date < today()) return NextResponse.json({ error: '지난 날짜는 예약할 수 없습니다.' }, { status: 400 });

  const sb = createPublicClient();
  const { data: clash } = await sb.from('reservations').select('user_name,start_time,end_time,status')
    .eq('facility', row.facility).eq('date', row.date).neq('status', 'rejected')
    .lt('start_time', row.end_time).gt('end_time', row.start_time);
  if (clash && clash.length) {
    const list = clash.map((c: any) => `${c.start_time.slice(0, 5)}~${c.end_time.slice(0, 5)} ${c.user_name}${c.status === 'pending' ? ' (승인 대기)' : ''}`).join(', ');
    return NextResponse.json({ error: `이미 예약된 시간과 겹칩니다 — ${list}. 다른 시간을 선택해 주세요.`, conflicts: clash }, { status: 409 });
  }

  const { error } = await sb.from('reservations').insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const fac = facilities.find((f) => f.id === row.facility)?.ko || row.facility;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  await notifyAdmin(`[기계공학과] 시설 예약 신청: ${fac} ${row.date} ${row.start_time}~${row.end_time}`,
    `<p>새 시설 예약 신청이 접수되었습니다.</p><table><tr><td>시설</td><td>${fac}</td></tr><tr><td>일시</td><td>${row.date} ${row.start_time}~${row.end_time}</td></tr><tr><td>신청자</td><td>${row.user_name}</td></tr><tr><td>연락처</td><td>${row.contact}</td></tr><tr><td>목적</td><td>${row.purpose}</td></tr></table><p><a href="${site}/${process.env.ADMIN_PATH || 'adm'}/reservations">관리자 페이지에서 승인하기</a></p>`);
  return NextResponse.json({ ok: true });
}
