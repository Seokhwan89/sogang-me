import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { translateKoToEn } from '@/lib/translate';

/** Admin-only: translate posts / faculty / pages that lack English, a few at a time (call repeatedly). */
export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: ok } = await sb.rpc('is_admin');
  if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { target = 'posts', batch = 4 } = await req.json().catch(() => ({}));
  let done = 0; let remaining = 0; const errors: string[] = [];

  if (target === 'posts') {
    const { data: rows, count } = await sb.from('posts').select('id,title_ko,title_en,content_ko,content_en,excerpt_ko,excerpt_en,members,advisor', { count: 'exact' })
      .or('title_en.is.null,content_en.is.null,excerpt_en.is.null').order('id').limit(batch);
    remaining = count || 0;
    for (const p of rows || []) {
      const fields: Record<string, string> = {};
      if (!p.title_en && p.title_ko) fields.title = p.title_ko;
      if (!p.content_en && p.content_ko) fields.content = p.content_ko;
      if (!p.excerpt_en && p.excerpt_ko) fields.excerpt = p.excerpt_ko;
      const out = Object.keys(fields).length ? await translateKoToEn(fields) : {};
      if (out === null) { errors.push(`post ${p.id}`); continue; }
      const upd: any = { title_en: p.title_en || out.title || p.title_ko, content_en: p.content_en || out.content || p.content_ko || '', excerpt_en: p.excerpt_en || out.excerpt || p.excerpt_ko || '' };
      const { error } = await sb.from('posts').update(upd).eq('id', p.id);
      if (error) errors.push(`post ${p.id}: ${error.message}`); else done++;
    }
    remaining = Math.max(0, remaining - done);
  } else if (target === 'faculty') {
    const { data: rows, count } = await sb.from('faculty').select('id,lab_ko,lab_en,research_ko,research_en,bio_ko,bio_en,name_en,name_ko', { count: 'exact' })
      .or('lab_en.is.null,research_en.is.null,bio_en.is.null,name_en.is.null').order('id').limit(batch);
    remaining = count || 0;
    for (const f of rows || []) {
      const fields: Record<string, string> = {};
      if (!f.lab_en && f.lab_ko) fields.lab = f.lab_ko;
      if (!f.research_en && f.research_ko) fields.research = f.research_ko;
      if (!f.bio_en && f.bio_ko) fields.bio = f.bio_ko;
      if (!f.name_en && f.name_ko) fields.name = f.name_ko;
      const out = Object.keys(fields).length ? await translateKoToEn(fields) : {};
      if (out === null) { errors.push(`faculty ${f.id}`); continue; }
      const upd: any = {};
      if (!f.lab_en) upd.lab_en = out.lab || f.lab_ko;
      if (!f.research_en && f.research_ko) upd.research_en = out.research || f.research_ko;
      if (!f.bio_en && f.bio_ko) upd.bio_en = out.bio || f.bio_ko;
      if (!f.name_en) upd.name_en = out.name || f.name_ko;
      if (Object.keys(upd).length === 0) upd.lab_en = f.lab_en || ''; // mark processed
      const { error } = await sb.from('faculty').update(upd).eq('id', f.id);
      if (error) errors.push(`faculty ${f.id}`); else done++;
    }
    remaining = Math.max(0, remaining - done);
  } else if (target === 'pages') {
    const { data: rows, count } = await sb.from('pages').select('slug,content_ko,content_en,title_ko,title_en', { count: 'exact' }).is('content_en', null).limit(batch);
    remaining = count || 0;
    for (const p of rows || []) {
      const out = await translateKoToEn({ content: p.content_ko || '', title: p.title_ko || '' });
      if (out === null) { errors.push(`page ${p.slug}`); continue; }
      const { error } = await sb.from('pages').update({ content_en: out.content || p.content_ko, title_en: p.title_en || out.title || null }).eq('slug', p.slug);
      if (error) errors.push(`page ${p.slug}`); else done++;
    }
    remaining = Math.max(0, remaining - done);
  }
  return NextResponse.json({ done, remaining, errors });
}
