import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { translateKoToEn, translateProvider } from '@/lib/translate';

export const maxDuration = 60;

/**
 * 관리자 전용 일괄 번역. 반복 호출하며 remaining이 0이 될 때까지 진행합니다.
 *  - force: false → 영문이 비어 있는 항목만
 *  - force: true  → 이미 있는 영문도 다시 번역 (무료 번역본을 Claude로 교체할 때)
 */
export async function POST(req: Request) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: ok } = await sb.rpc('is_admin');
  if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const target = body.target || 'posts';
  const batch = Math.min(Number(body.batch) || 3, 8);
  const force = !!body.force;
  const board = body.board || null;
  let done = 0; let remaining = 0; const errors: string[] = [];

  if (target === 'posts') {
    let q = sb.from('posts').select('id,title_ko,title_en,content_ko,content_en,excerpt_ko,excerpt_en,category,category_en', { count: 'exact' });
    if (board) q = q.eq('board', board);
    q = force
      ? q.is('en_verified', null).order('id')
      : q.or('title_en.is.null,content_en.is.null,excerpt_en.is.null').order('id');
    const { data: rows, count } = await q.limit(batch);
    remaining = count || 0;
    for (const p of rows || []) {
      const fields: Record<string, string> = {};
      if (p.title_ko && (force || !p.title_en)) fields.title = p.title_ko;
      if (p.content_ko && (force || !p.content_en)) fields.content = p.content_ko.slice(0, 12000);
      if (p.excerpt_ko && (force || !p.excerpt_en)) fields.excerpt = p.excerpt_ko;
      if (p.category && (force || !p.category_en)) fields.category = p.category;
      const out = Object.keys(fields).length ? await translateKoToEn(fields) : {};
      if (out === null) { errors.push('post ' + p.id); continue; }
      const upd: any = { en_verified: force ? new Date().toISOString() : null };
      if (fields.title) upd.title_en = out.title || p.title_ko;
      if (fields.content) upd.content_en = out.content || p.content_ko;
      if (fields.excerpt) upd.excerpt_en = out.excerpt || p.excerpt_ko;
      if (fields.category) upd.category_en = out.category || p.category;
      if (!force) { upd.title_en = upd.title_en ?? p.title_en ?? p.title_ko; upd.content_en = upd.content_en ?? p.content_en ?? p.content_ko ?? ''; upd.excerpt_en = upd.excerpt_en ?? p.excerpt_en ?? p.excerpt_ko ?? ''; delete upd.en_verified; }
      const { error } = await sb.from('posts').update(upd).eq('id', p.id);
      if (error) errors.push('post ' + p.id + ': ' + error.message); else done++;
    }
    remaining = Math.max(0, remaining - done);
  } else if (target === 'faculty') {
    let q = sb.from('faculty').select('id,lab_ko,lab_en,research_ko,research_en,bio_ko,bio_en,name_en,name_ko', { count: 'exact' });
    q = force ? q.is('en_verified', null).order('id') : q.or('lab_en.is.null,name_en.is.null').order('id');
    const { data: rows, count } = await q.limit(batch);
    remaining = count || 0;
    for (const f of rows || []) {
      const fields: Record<string, string> = {};
      if (f.lab_ko && (force || !f.lab_en)) fields.lab = f.lab_ko;
      if (f.research_ko && (force || !f.research_en)) fields.research = f.research_ko;
      if (f.bio_ko && (force || !f.bio_en)) fields.bio = f.bio_ko;
      if (f.name_ko && !f.name_en) fields.name = f.name_ko;
      const out = Object.keys(fields).length ? await translateKoToEn(fields) : {};
      if (out === null) { errors.push('faculty ' + f.id); continue; }
      const upd: any = {};
      if (fields.lab) upd.lab_en = out.lab || f.lab_ko;
      if (fields.research) upd.research_en = out.research || f.research_ko;
      if (fields.bio) upd.bio_en = out.bio || f.bio_ko;
      if (fields.name) upd.name_en = out.name || f.name_ko;
      if (force) upd.en_verified = new Date().toISOString();
      if (!Object.keys(upd).length) upd.lab_en = f.lab_en || '';
      const { error } = await sb.from('faculty').update(upd).eq('id', f.id);
      if (error) errors.push('faculty ' + f.id); else done++;
    }
    remaining = Math.max(0, remaining - done);
  } else if (target === 'pages') {
    const { data: rows, count } = await sb.from('pages').select('slug,content_ko,content_en,title_ko,title_en', { count: 'exact' })
      .is('content_en', null).limit(batch);
    remaining = count || 0;
    for (const p of rows || []) {
      const out = await translateKoToEn({ content: p.content_ko || '', title: p.title_ko || '' });
      if (out === null) { errors.push('page ' + p.slug); continue; }
      const { error } = await sb.from('pages').update({ content_en: out.content || p.content_ko, title_en: p.title_en || out.title || null }).eq('slug', p.slug);
      if (error) errors.push('page ' + p.slug); else done++;
    }
    remaining = Math.max(0, remaining - done);
  }
  return NextResponse.json({ done, remaining, errors, provider: translateProvider() });
}
