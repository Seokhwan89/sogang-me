import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';
import { notifyAdmin } from '@/lib/notify';
import { facilities } from '@/lib/nav';

export async function POST(req: Request) {
  const b = await req.json();
  const row = { facility: String(b.facility || ''), date: String(b.date || ''), start_time: String(b.start_time || ''), end_time: String(b.end_time || ''), user_name: String(b.user_name || '').slice(0, 80), contact: String(b.contact || '').slice(0, 120), purpose: String(b.purpose || '').slice(0, 300), affiliation: String(b.affiliation || '').slice(0, 120), status: 'pending' };
  if (!row.facility || !row.date || !row.start_time || !row.end_time || !row.user_name || !row.contact) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  if (row.start_time >= row.end_time) return NextResponse.json({ error: 'time' }, { status: 400 });
  const sb = createPublicClient();
  const { error } = await sb.from('reservations').insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const fac = facilities.find((f) => f.id === row.facility)?.ko || row.facility;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  await notifyAdmin(`[기계공학과] 시설 예약 신청: ${fac} ${row.date} ${row.start_time}~${row.end_time}`,
    `<p>새 시설 예약 신청이 접수되었습니다.</p><table><tr><td>시설</td><td>${fac}</td></tr><tr><td>일시</td><td>${row.date} ${row.start_time}~${row.end_time}</td></tr><tr><td>신청자</td><td>${row.user_name}</td></tr><tr><td>연락처</td><td>${row.contact}</td></tr><tr><td>목적</td><td>${row.purpose}</td></tr></table><p><a href="${site}/${process.env.ADMIN_PATH || 'adm'}/reservations">관리자 페이지에서 승인하기</a></p>`);
  return NextResponse.json({ ok: true });
}
