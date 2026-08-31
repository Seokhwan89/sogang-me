import { createPublicClient } from './supabase-server';
import type { Post } from '@/components/PostCard';
import { safeQuery } from './search';

const safe = async <T,>(fn: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> => {
  try { const { data, error } = await fn(); if (error) { console.error(error.message); return fallback; } return data ?? fallback; }
  catch (e: any) { console.error(e?.message); return fallback; }
};

export async function getHomeData() {
  const sb = createPublicClient();
  const [posts, gallery, banners, settings, promo, videos] = await Promise.all([
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,images,video_url,created_at,is_pinned')
      .in('board', ['notice', 'research', 'award', 'alumni_news']).eq('published', true).eq('show_on_home', true)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(120) as any, []),
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,thumbnail_url,images,created_at').eq('board', 'gallery').eq('published', true).order('created_at', { ascending: false }).limit(8) as any, []),
    safe<any[]>(() => sb.from('banners').select('*').eq('visible', true).order('sort_order') as any, []),
    safe<any>(() => sb.from('site_settings').select('value').eq('key', 'home').single() as any, null),
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,attachments,created_at').eq('board', 'promo').eq('published', true).order('sort_order').order('created_at', { ascending: false }).limit(2) as any, []),
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,video_url,category,category_en,sort_order,created_at').eq('board', 'videos').eq('published', true).order('sort_order').limit(4) as any, []),
  ]);
  const n = settings?.value?.news_count ?? 8;
  const groups: Record<string, Post[]> = { notice: [], research: [], award: [], alumni_news: [] };
  for (const p of posts) if (groups[p.board] && groups[p.board].length < n) groups[p.board].push(p);
  return { groups, gallery, banners, settings: settings?.value ?? {}, promo, videos };
}

export async function getPosts(board: string, page = 1, per = 15, q = '') {
  const sb = createPublicClient();
  let query = sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,images,created_at,is_pinned,view_count,author,attachments,video_url,term,members,advisor,category,category_en,sort_order', { count: 'exact' })
    .eq('board', board).eq('published', true);
  const qs = safeQuery(q);
  if (qs) query = query.or(`title_ko.ilike.%${qs}%,title_en.ilike.%${qs}%,content_ko.ilike.%${qs}%,members.ilike.%${qs}%`);
  const from = (page - 1) * per;
  const { data, count, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).range(from, from + per - 1);
  if (error) { console.error(error.message); return { posts: [] as Post[], total: 0 }; }
  return { posts: (data || []) as Post[], total: count || 0 };
}
export async function getPost(id: number) {
  const sb = createPublicClient();
  const { data } = await sb.from('posts').select('*').eq('id', id).eq('published', true).single();
  return data as Post | null;
}
export async function getAdjacent(board: string, id: number, created: string) {
  const sb = createPublicClient();
  const [{ data: prev }, { data: next }] = await Promise.all([
    sb.from('posts').select('id,title_ko,title_en').eq('board', board).eq('published', true).lt('created_at', created).order('created_at', { ascending: false }).limit(1),
    sb.from('posts').select('id,title_ko,title_en').eq('board', board).eq('published', true).gt('created_at', created).order('created_at', { ascending: true }).limit(1),
  ]);
  return { prev: prev?.[0] || null, next: next?.[0] || null };
}
export async function getFaculty(emeritus = false) {
  const sb = createPublicClient();
  let query = sb.from('faculty').select('*').eq('is_emeritus', emeritus).eq('published', true);
  // 석좌교수(field='chair')는 전임교수 목록에서 제외하고 전용 페이지에서만 노출한다.
  if (!emeritus) query = query.or('field.is.null,field.neq.chair');
  const { data } = await query.order('sort_order');
  return data || [];
}
/** 석좌교수(Chair Professor) 목록 — field='chair'로 구분한다. */
export async function getChair() {
  const sb = createPublicClient();
  const { data } = await sb.from('faculty').select('*').eq('field', 'chair').eq('published', true).order('sort_order');
  return data || [];
}
export async function getFacultyOne(id: number) {
  const sb = createPublicClient(); const { data } = await sb.from('faculty').select('*').eq('id', id).single(); return data;
}
export async function getPage(slug: string) {
  const sb = createPublicClient(); const { data } = await sb.from('pages').select('*').eq('slug', slug).maybeSingle(); return data;
}
export async function getReservations(facility: string, year: number, month: number) {
  const sb = createPublicClient();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endD = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${endD}`;
  const { data } = await sb.from('reservations').select('*').eq('facility', facility).gte('date', start).lte('date', end).neq('status', 'rejected').order('date').order('start_time');
  return data || [];
}

/** 전임교수 중 연구실이 등록된 수 — '18개 연구실' 같은 문구를 DB와 연동하기 위해 사용합니다. */
export async function getLabCount() {
  const sb = createPublicClient();
  const { count } = await sb.from('faculty').select('id', { count: 'exact', head: true }).eq('is_emeritus', false).eq('published', true).not('lab_ko', 'is', null);
  return count || 0;
}
