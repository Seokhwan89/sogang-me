'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { translateKoToEn } from '@/lib/translate';
import { toHtml } from '@/lib/html';
import { researchGroupDefs } from '@/lib/groups';
import { buildingOf } from '@/lib/buildings';

import { adminBase as base } from '@/lib/admin';

async function admin() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('unauthorized');
  const { data: ok } = await sb.rpc('is_admin');
  if (!ok) throw new Error('forbidden');
  return sb;
}
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const str = (fd: FormData, k: string) => (fd.get(k) as string | null)?.toString() ?? '';
const nul = (s: string) => (s.trim() ? s : null);
/** Storage의 media 버킷에 있는 파일이면 경로만 뽑아 삭제합니다. */
function mediaPaths(urls: string[]) {
  return urls.map((u) => { const m = (u || '').match(/\/storage\/v1\/object\/public\/media\/(.+)$/); return m ? decodeURIComponent(m[1]) : null; }).filter(Boolean) as string[];
}
async function removeMedia(sb: any, row: any) {
  const urls = [row?.thumbnail_url, ...(row?.images || []).map((i: any) => i.url), ...(row?.attachments || []).map((f: any) => f.url)].filter(Boolean);
  const inBody = [...String(row?.content_ko || '' ).matchAll(/src="([^"]+)"/g), ...String(row?.content_en || '').matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  const paths = mediaPaths([...urls, ...inBody]);
  if (paths.length) await sb.storage.from('media').remove(paths);
  return paths.length;
}
const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);

export async function signOut() {
  const sb = createClient(); await sb.auth.signOut(); redirect(base());
}

export async function savePost(fd: FormData) {
  const sb = await admin();
  const id = str(fd, 'id');
  const row: any = {
    board: str(fd, 'board'), title_ko: str(fd, 'title_ko'), title_en: nul(str(fd, 'title_en')),
    content_ko: toHtml(str(fd, 'content_ko')), content_en: nul(toHtml(str(fd, 'content_en'))),
    video_url: nul(str(fd, 'video_url')), term: nul(str(fd, 'term')), members: nul(str(fd, 'members')), advisor: nul(str(fd, 'advisor')), category: nul(str(fd, 'category')), sort_order: Number(str(fd, 'sort_order') || 100),
    excerpt_ko: nul(str(fd, 'excerpt_ko')) || strip(str(fd, 'content_ko')), excerpt_en: nul(str(fd, 'excerpt_en')),
    thumbnail_url: nul(str(fd, 'thumbnail_url')), author: str(fd, 'author') || '기계공학과',
    is_pinned: bool(fd, 'is_pinned'), show_on_home: bool(fd, 'show_on_home'), published: bool(fd, 'published'),
    images: JSON.parse(str(fd, 'images') || '[]'), attachments: JSON.parse(str(fd, 'attachments') || '[]'),
    updated_at: new Date().toISOString(),
  };
  const created = str(fd, 'created_at'); if (created) row.created_at = created;

  /* 번역 정책
   *  changed : 국문이 바뀐 항목만 다시 번역 (기본값) — 국문·영문이 어긋나는 것을 막습니다
   *  missing : 영문이 비어 있는 항목만 번역
   *  none    : 번역하지 않음 (영문을 직접 손봤거나 오타만 고친 경우)
   * 관리자가 영문 칸을 직접 수정하면 그 항목은 자동 번역이 덮어쓰지 않습니다. */
  const mode = str(fd, 'translate_mode') || 'changed';
  if (mode !== 'none') {
    let prev: any = null;
    if (id) { const { data } = await sb.from('posts').select('title_ko,content_ko,excerpt_ko,category,title_en,content_en,excerpt_en,category_en').eq('id', Number(id)).single(); prev = data; }
    const editedEn = (k: string) => !!prev && nul(str(fd, k)) !== (prev[k] ?? null);   // 관리자가 영문을 직접 고쳤는지
    const koChanged = (k: string) => !prev || (row[k] || '') !== (prev[k] || '');
    const need = (koKey: string, enKey: string) =>
      !!row[koKey] && !editedEn(enKey) && (mode === 'missing' ? !row[enKey] : (koChanged(koKey) || !row[enKey]));

    const fields: Record<string, string> = {};
    if (need('title_ko', 'title_en')) fields.title = row.title_ko;
    if (need('content_ko', 'content_en')) fields.content = row.content_ko;
    if (need('excerpt_ko', 'excerpt_en')) fields.excerpt = row.excerpt_ko;
    if (need('category', 'category_en')) fields.category = row.category;

    if (Object.keys(fields).length) {
      const out = await translateKoToEn(fields);
      if (out) {
        if (fields.title && out.title) row.title_en = out.title;
        if (fields.content && out.content) row.content_en = out.content;
        if (fields.excerpt && out.excerpt) row.excerpt_en = out.excerpt;
        if (fields.category && out.category) row.category_en = out.category;
      }
    }
  }

  const q = id ? sb.from('posts').update(row).eq('id', Number(id)) : sb.from('posts').insert(row);
  const { error } = await q; if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
  redirect(`${base()}/posts?board=${row.board}`);
}

export async function deletePost(fd: FormData) {
  const sb = await admin(); const id = Number(str(fd, 'id')); const board = str(fd, 'board');
  const { data: row } = await sb.from('posts').select('thumbnail_url,images,attachments,content_ko,content_en').eq('id', id).single();
  if (row) await removeMedia(sb, row);   // 글을 지우면 첨부·본문 이미지도 저장소에서 함께 삭제
  await sb.from('posts').delete().eq('id', id); revalidatePath('/', 'layout'); redirect(`${base()}/posts?board=${board}`);
}

export async function saveFaculty(fd: FormData) {
  const sb = await admin(); const id = str(fd, 'id');
  const row: any = {};
  for (const k of ['name_ko', 'name_en', 'title_ko', 'title_en', 'email', 'tel', 'lab_ko', 'lab_en', 'lab_url', 'photo_url', 'field', 'research_ko', 'research_en', 'bio_ko', 'bio_en']) row[k] = nul(str(fd, k));
  row.building = nul(str(fd, 'building')); row.room = nul(str(fd, 'room'));
  const bdg = buildingOf(row.building);
  row.office = bdg ? (row.room ? `${bdg.ko}(${bdg.code}) ${row.room}호` : `${bdg.ko}(${bdg.code})`) : null;
  row.name_ko = str(fd, 'name_ko'); row.sort_order = Number(str(fd, 'sort_order') || 100);
  row.is_emeritus = bool(fd, 'is_emeritus'); row.published = bool(fd, 'published');
  row.groups = researchGroupDefs.filter((g) => bool(fd, `group_${g.id}`)).map((g) => g.id);
  /* 교수 정보도 같은 정책: 국문이 바뀐 항목만 다시 번역 */
  const mode = str(fd, 'translate_mode') || 'changed';
  if (mode !== 'none') {
    let prev: any = null;
    if (id) { const { data } = await sb.from('faculty').select('lab_ko,lab_en,research_ko,research_en,bio_ko,bio_en,name_ko,name_en').eq('id', Number(id)).single(); prev = data; }
    const editedEn = (k: string) => !!prev && nul(str(fd, k)) !== (prev[k] ?? null);
    const koChanged = (k: string) => !prev || (row[k] || '') !== (prev[k] || '');
    const need = (koKey: string, enKey: string) =>
      !!row[koKey] && !editedEn(enKey) && (mode === 'missing' ? !row[enKey] : (koChanged(koKey) || !row[enKey]));
    const fields: Record<string, string> = {};
    if (need('lab_ko', 'lab_en')) fields.lab = row.lab_ko;
    if (need('research_ko', 'research_en')) fields.research = row.research_ko;
    if (need('bio_ko', 'bio_en')) fields.bio = row.bio_ko;
    if (row.name_ko && !row.name_en) fields.name = row.name_ko;
    if (Object.keys(fields).length) {
      const out = await translateKoToEn(fields);
      if (out) {
        if (fields.lab && out.lab) row.lab_en = out.lab;
        if (fields.research && out.research) row.research_en = out.research;
        if (fields.bio && out.bio) row.bio_en = out.bio;
        if (fields.name && out.name) row.name_en = out.name;
      }
    }
  }
  const q = id ? sb.from('faculty').update(row).eq('id', Number(id)) : sb.from('faculty').insert(row);
  const { error } = await q; if (error) throw new Error(error.message);
  revalidatePath('/', 'layout'); redirect(`${base()}/faculty`);
}
export async function deleteFaculty(fd: FormData) {
  const sb = await admin(); const id = Number(str(fd, 'id'));
  const { data: row } = await sb.from('faculty').select('photo_url').eq('id', id).single();
  if (row?.photo_url) await removeMedia(sb, { thumbnail_url: row.photo_url });
  await sb.from('faculty').delete().eq('id', id); revalidatePath('/', 'layout'); redirect(`${base()}/faculty`);
}

export async function savePage(fd: FormData) {
  const sb = await admin(); const slug = str(fd, 'slug');
  const row: any = { slug, title_ko: nul(str(fd, 'title_ko')), title_en: nul(str(fd, 'title_en')), content_ko: nul(toHtml(str(fd, 'content_ko'))), content_en: nul(toHtml(str(fd, 'content_en'))), updated_at: new Date().toISOString() };
  const mode = str(fd, 'translate_mode') || 'changed';
  if (mode !== 'none' && row.content_ko) {
    const { data: prev } = await sb.from('pages').select('content_ko,content_en').eq('slug', slug).maybeSingle();
    const editedEn = !!prev && row.content_en !== (prev.content_en ?? null);
    const koChanged = !prev || row.content_ko !== (prev.content_ko || '');
    const need = !editedEn && (mode === 'missing' ? !row.content_en : (koChanged || !row.content_en));
    if (need) { const out = await translateKoToEn({ content: row.content_ko }); if (out?.content) row.content_en = out.content; }
  }
  const { error } = await sb.from('pages').upsert(row); if (error) throw new Error(error.message);
  revalidatePath('/', 'layout'); redirect(`${base()}/pages`);
}

export async function resetPage(fd: FormData) {
  const sb = await admin(); await sb.from('pages').delete().eq('slug', str(fd, 'slug')); revalidatePath('/', 'layout'); redirect(`${base()}/pages`);
}

export async function setReservation(fd: FormData) {
  const sb = await admin(); const id = Number(str(fd, 'id')); const status = str(fd, 'status');
  if (status === 'delete') await sb.from('reservations').delete().eq('id', id); else await sb.from('reservations').update({ status }).eq('id', id);
  revalidatePath('/', 'layout'); redirect(`${base()}/reservations`);
}
export async function addReservation(fd: FormData) {
  const sb = await admin();
  const { error } = await sb.from('reservations').insert({ facility: str(fd, 'facility'), date: str(fd, 'date'), start_time: str(fd, 'start_time'), end_time: str(fd, 'end_time'), user_name: str(fd, 'user_name'), purpose: nul(str(fd, 'purpose')), status: 'approved' });
  if (error) throw new Error(error.message); revalidatePath('/', 'layout'); redirect(`${base()}/reservations`);
}

export async function saveSettings(fd: FormData) {
  const sb = await admin();
  const sections = ['hero', 'promo', 'intro', 'news', 'videos', 'programs', 'quicklinks', 'gallery'].filter((s) => bool(fd, `sec_${s}`));
  const order = str(fd, 'order').split(',').map((s) => s.trim()).filter(Boolean);
  const ordered = [...order.filter((s) => sections.includes(s)), ...sections.filter((s) => !order.includes(s))];
  const value = { sections: ordered, news_count: Number(str(fd, 'news_count') || 8), tagline_ko: nul(str(fd, 'tagline_ko')), tagline_en: nul(str(fd, 'tagline_en')), hero_video_url: nul(str(fd, 'hero_video_url')), hero_poster_url: nul(str(fd, 'hero_poster_url')), notify_email: nul(str(fd, 'notify_email')) };
  const { error } = await sb.from('site_settings').upsert({ key: 'home', value, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message); revalidatePath('/', 'layout'); redirect(`${base()}/settings`);
}

export async function saveBanner(fd: FormData) {
  const sb = await admin(); const id = str(fd, 'id');
  const row: any = { title_ko: nul(str(fd, 'title_ko')), title_en: nul(str(fd, 'title_en')), subtitle_ko: nul(str(fd, 'subtitle_ko')), subtitle_en: nul(str(fd, 'subtitle_en')), image_url: nul(str(fd, 'image_url')), link: nul(str(fd, 'link')), sort_order: Number(str(fd, 'sort_order') || 100), visible: bool(fd, 'visible') };
  const q = id ? sb.from('banners').update(row).eq('id', Number(id)) : sb.from('banners').insert(row);
  const { error } = await q; if (error) throw new Error(error.message); revalidatePath('/', 'layout'); redirect(`${base()}/banners`);
}
export async function deleteBanner(fd: FormData) {
  const sb = await admin(); const id = Number(str(fd, 'id'));
  const { data: row } = await sb.from('banners').select('image_url').eq('id', id).single();
  if (row?.image_url) await removeMedia(sb, { thumbnail_url: row.image_url });
  await sb.from('banners').delete().eq('id', id); revalidatePath('/', 'layout'); redirect(`${base()}/banners`);
}
export async function addAdmin(fd: FormData) {
  const sb = await admin(); const email = str(fd, 'email').trim().toLowerCase();
  if (email) await sb.from('admins').insert({ email }); redirect(`${base()}/settings`);
}

export async function setUreca(fd: FormData) {
  const sb = await admin(); const id = Number(str(fd, 'id')); const status = str(fd, 'status');
  if (status === 'delete') await sb.from('ureca_applications').delete().eq('id', id); else await sb.from('ureca_applications').update({ status }).eq('id', id);
  redirect(`${base()}/ureca`);
}
