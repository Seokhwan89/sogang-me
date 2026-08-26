import { createPublicClient } from './supabase-server';
import type { Post } from '@/components/PostCard';

const safe = async <T,>(fn: () => Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> => {
  try { const { data, error } = await fn(); if (error) { console.error(error.message); return fallback; } return data ?? fallback; }
  catch (e: any) { console.error(e?.message); return fallback; }
};

export async function getHomeData() {
  const sb = createPublicClient();
  const [posts, gallery, banners, settings, facultyCount] = await Promise.all([
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,created_at,is_pinned')
      .in('board', ['notice', 'research', 'award']).eq('published', true).eq('show_on_home', true)
      .order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(60) as any, []),
    safe<Post[]>(() => sb.from('posts').select('id,board,title_ko,title_en,thumbnail_url,images,created_at').eq('board', 'gallery').eq('published', true).order('created_at', { ascending: false }).limit(6) as any, []),
    safe<any[]>(() => sb.from('banners').select('*').eq('visible', true).order('sort_order') as any, []),
    safe<any>(() => sb.from('site_settings').select('value').eq('key', 'home').single() as any, null),
    safe<any>(() => sb.from('faculty').select('id', { count: 'exact', head: true }).eq('is_emeritus', false).eq('published', true) as any, null),
  ]);
  const n = settings?.value?.news_count ?? 6;
  const groups: Record<string, Post[]> = { notice: [], research: [], award: [] };
  for (const p of posts) if (groups[p.board] && groups[p.board].length < n) groups[p.board].push(p);
  return { groups, gallery, banners, settings: settings?.value ?? {}, facultyCount: 18 };
}

export async function getPosts(board: string, page = 1, per = 15, q = '') {
  const sb = createPublicClient();
  let query = sb.from('posts').select('id,board,title_ko,title_en,excerpt_ko,excerpt_en,thumbnail_url,images,created_at,is_pinned,view_count,author,attachments', { count: 'exact' })
    .eq('board', board).eq('published', true);
  if (q) query = query.or(`title_ko.ilike.%${q}%,title_en.ilike.%${q}%,content_ko.ilike.%${q}%`);
  const from = (page - 1) * per;
  const { data, count, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).range(from, from + per - 1);
  if (error) { console.error(error.message); return { posts: [] as Post[], total: 0 }; }
  return { posts: (data || []) as Post[], total: count || 0 };
}

export async function getPost(id: number) {
  const sb = createPublicClient();
  const { data } = await sb.from('posts').select('*').eq('id', id).eq('published', true).single();
  if (data) sb.rpc('increment_view', { post_id: id }).then(() => {});
  return data as Post | null;
}

export async function getFaculty(emeritus = false) {
  const sb = createPublicClient();
  const { data } = await sb.from('faculty').select('*').eq('is_emeritus', emeritus).eq('published', true).order('sort_order');
  return data || [];
}
export async function getFacultyOne(id: number) {
  const sb = createPublicClient();
  const { data } = await sb.from('faculty').select('*').eq('id', id).single();
  return data;
}
export async function getPage(slug: string) {
  const sb = createPublicClient();
  const { data } = await sb.from('pages').select('*').eq('slug', slug).maybeSingle();
  return data;
}
export async function getReservations(facility: string, year: number, month: number) {
  const sb = createPublicClient();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endD = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${endD}`;
  const { data } = await sb.from('reservations').select('*').eq('facility', facility).gte('date', start).lte('date', end).neq('status', 'rejected').order('date').order('start_time');
  return data || [];
}
