import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';
import { allow, clientIp } from '@/lib/ratelimit';

/** 조회수 집계: 방문자당 게시글 1회만 (클라이언트가 sessionStorage로 중복 호출 차단, 서버는 봇 UA 제외 + IP·글별 재호출 제한). */
export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({ id: 0 }));
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) return NextResponse.json({ ok: false }, { status: 400 });
  const ua = req.headers.get('user-agent') || '';
  if (/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless/i.test(ua)) return NextResponse.json({ ok: true, skipped: 'bot' });
  if (!allow(`view:${clientIp(req)}:${postId}`, 1, 60 * 1000)) return NextResponse.json({ ok: true, skipped: 'dup' });
  const sb = createPublicClient();
  await sb.rpc('increment_view', { post_id: postId });
  return NextResponse.json({ ok: true });
}
