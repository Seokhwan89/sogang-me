import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { fmtDate } from '@/components/PostCard';
import { getPost } from '@/lib/data';
import { t, T, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 60;

export default async function PostPage({ params }: { params: { locale: Locale; board: string; id: string } }) {
  const { locale: l, board } = params; const ko = l === 'ko';
  const p = await getPost(Number(params.id)); if (!p || p.board !== board) notFound();
  const html = t(p, 'content', l);
  const section = board === 'alumni_news' ? 'alumni' : 'board';
  const images: { url: string; caption?: string }[] = p.images || [];
  const files: { name: string; url: string; size?: number }[] = p.attachments || [];
  return (<>
    <PageHero locale={l} section={section} current={board === 'alumni_news' ? 'news' : board} />
    <article className="container-site py-12 max-w-4xl">
      <header className="border-b border-sg-ink pb-6">
        <span className="eyebrow">{T(l, board as any) || board}</span>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold leading-snug tracking-tight">{t(p, 'title', l)}</h1>
        {!ko && !p.title_en && <p className="mt-2 text-[12px] text-sg-steel font-mono">Korean original · English translation not yet available</p>}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[12px] text-sg-steel">
          <span>{T(l, 'author')} · {p.author}</span><span>{T(l, 'date')} · {fmtDate(p.created_at)}</span><span>{T(l, 'views')} · {p.view_count}</span>
        </div>
      </header>
      {images.length > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">{images.map((im, i) => (
          <figure key={i} className={i === 0 && images.length % 2 === 1 ? 'sm:col-span-2' : ''}>
            <img src={im.url} alt={im.caption || ''} className="w-full h-auto" loading="lazy" />
            {im.caption && <figcaption className="text-[12px] text-sg-steel mt-1">{im.caption}</figcaption>}
          </figure>
        ))}</div>
      )}
      <div className="prose-sg mt-8 min-h-[120px]" dangerouslySetInnerHTML={{ __html: html || `<p class="text-sg-steel">${ko ? '본문이 없습니다.' : 'No content.'}</p>` }} />
      {files.length > 0 && (
        <section className="mt-10 border border-sg-line p-5">
          <p className="eyebrow">{T(l, 'attachments')}</p>
          <ul className="mt-3 space-y-2">{files.map((f, i) => (
            <li key={i}><a href={f.url} download className="flex items-center gap-2 text-[14px] hover:text-sg-red"><span className="font-mono text-sg-steel">↓</span>{f.name}{f.size ? <span className="font-mono text-[11px] text-sg-steel">({Math.round(f.size / 1024)} KB)</span> : null}</a></li>
          ))}</ul>
        </section>
      )}
      <p className="mt-12"><Link href={`/${l}/board/${board}`} className="btn-ghost">← {T(l, 'list')}</Link></p>
    </article>
  </>);
}
