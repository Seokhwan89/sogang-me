import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { adminBase } from '@/lib/admin';
import { boards } from '@/lib/nav';
import { ui } from '@/lib/i18n';

export default async function Dashboard() {
  const sb = createClient(); const b = adminBase();
  const counts = await Promise.all(boards.map(async (bd) => { const { count } = await sb.from('posts').select('id', { count: 'exact', head: true }).eq('board', bd); return [bd, count || 0] as const; }));
  const { count: pending } = await sb.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: fac } = await sb.from('faculty').select('id', { count: 'exact', head: true });
  return (
    <div>
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href={`${b}/reservations`} className={`card p-5 ${pending ? 'border-sg-red' : ''}`}><p className="eyebrow">승인 대기 예약</p><p className="mt-2 font-mono text-3xl">{pending || 0}</p></Link>
        <Link href={`${b}/faculty`} className="card p-5"><p className="eyebrow">교수진</p><p className="mt-2 font-mono text-3xl">{fac || 0}</p></Link>
        <Link href={`${b}/posts/new`} className="card p-5 !bg-sg-cardinal !border-sg-cardinal text-white"><p className="eyebrow !text-white/60">빠른 작업</p><p className="mt-2 font-semibold">+ 새 게시글 작성</p></Link>
      </div>
      <h2 className="mt-10 font-bold">게시판별 글 수</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">{counts.map(([bd, c]) => <Link key={bd} href={`${b}/posts?board=${bd}`} className="card p-4 flex justify-between"><span>{ui.ko[bd]}</span><span className="font-mono">{c}</span></Link>)}</div>
    </div>
  );
}
