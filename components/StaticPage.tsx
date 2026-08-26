import PageHero from './PageHero';
import { staticPages } from '@/content';
import { getPage } from '@/lib/data';
import type { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

/** Renders an editable static page: DB row (pages table) wins, otherwise built-in content. */
export default async function StaticPage({ locale, section, slug, children }: { locale: Locale; section: string; slug: string; children?: React.ReactNode }) {
  const key = `${section}/${slug}`;
  const builtin = staticPages[key];
  const db = await getPage(key);
  const html = locale === 'en' ? (db?.content_en || builtin?.en || db?.content_ko || builtin?.ko) : (db?.content_ko || builtin?.ko);
  if (!builtin && !db && !children) notFound();
  return (
    <>
      <PageHero locale={locale} section={section} current={slug} title={locale === 'en' ? db?.title_en || undefined : db?.title_ko || undefined} />
      <article className="container-site py-14 max-w-4xl">
        {children}
        {html && <div className="prose-sg" dangerouslySetInnerHTML={{ __html: html }} />}
      </article>
    </>
  );
}
