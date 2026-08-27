import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';
import { notifyAdmin } from '@/lib/notify';

export async function POST(req: Request) {
  const b = await req.json();
  const choices = Array.isArray(b.choices) ? b.choices.filter((c: any) => c && c.rank && c.lab).slice(0, 3) : [];
  const row = { year: Number(b.year), term: String(b.term || ''), name: String(b.name || '').slice(0, 60), student_id: String(b.student_id || '').slice(0, 30), semester: String(b.semester || '').slice(0, 30), phone: String(b.phone || '').slice(0, 40), email: String(b.email || '').slice(0, 120), choices, message: String(b.message || '').slice(0, 1000), status: 'pending' };
  if (!row.year || !row.term || !row.name || !row.student_id || !row.email || !choices.length) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  const sb = createPublicClient();
  /* 같은 학생이 같은 연도·학기에 다시 제출하면 이전 지원서를 대체합니다 (마지막 제출본만 유지). */
  const { data: prev } = await sb.from('ureca_applications').select('id')
    .eq('year', row.year).eq('term', row.term).eq('student_id', row.student_id).order('created_at', { ascending: false });
  const replaced = (prev || []).length > 0;
  const { error } = await sb.from('ureca_applications').insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (replaced) await sb.from('ureca_applications').delete().in('id', (prev || []).map((p: any) => p.id));
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const termKo: Record<string, string> = { spring: '봄학기', summer: '여름방학', fall: '가을학기', winter: '겨울방학' };
  await notifyAdmin(`[기계공학과] URECA 인턴 지원${replaced ? ' (수정 제출)' : ''}: ${row.name} (${row.year} ${termKo[row.term] || row.term})`,
    `<p>${replaced ? '기존 지원서를 대체하는 <strong>수정 제출</strong>이 접수되었습니다.' : '새 URECA 인턴 지원서가 접수되었습니다.'}</p><table><tr><td>지원기간</td><td>${row.year} ${termKo[row.term] || row.term}</td></tr><tr><td>이름/학번</td><td>${row.name} / ${row.student_id}</td></tr><tr><td>현재학기</td><td>${row.semester}</td></tr><tr><td>연락처</td><td>${row.phone} / ${row.email}</td></tr><tr><td>지원 연구실</td><td>${choices.map((c: any) => `${c.rank}지망 ${c.lab} (${c.prof})`).join('<br>')}</td></tr></table><p><a href="${site}/${process.env.ADMIN_PATH || 'adm'}/ureca">관리자 페이지에서 확인</a></p>`);
  return NextResponse.json({ ok: true, replaced });
}
