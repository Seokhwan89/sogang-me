import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { fmtDate } from '@/components/PostCard';
import { getPost, getAdjacent } from '@/lib/data';
import { t, T, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 60;

export default async function PostPage({ params }: { params: { locale: Locale; board: string; id: string } }) {
  const { locale: l, board } = params; const ko = l === 'ko';
  const p = await getPost(Number(params.id)); if (!p || p.board !== board) notFound();
  const { prev, next } = await getAdjacent(board, p.id, p.created_at);
  const html = t(p, 'content', l);
  const section = board === 'alumni_news' ? 'alumni' : 'board';
  const images: { url: string; caption?: string }[] = p.images || [];
  const files: { name: string; url: string; size?: number }[] = p.attachments || [];
  const contentHasImg = /<img/i.test(html || '');
  return (<>
    <PageHero locale={l} section={section} current={board === 'alumni_news' ? 'news' : board} image={p.thumbnail_url || images[0]?.url || undefined} />
    <article className="container-site py-14 max-w-4xl">
      <header className="border-b-2 border-sg-ink pb-7">
        <span className="eyebrow">{T(l, board as any) || board}</span>
        <h1 className="mt-3 font-brand text-[1.9rem] md:text-[2.5rem] leading-snug">{t(p, 'title', l)}</h1>
        {!ko && !p.title_en && <p className="mt-2 text-[13px] text-sg-gray9">Korean original · English translation not yet available</p>}
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-sg-gray9">
          <span>{T(l, 'author')} · {p.author}</span><span>{T(l, 'date')} · {fmtDate(p.created_at)}</span><span>{T(l, 'views')} · {p.view_count}</span>
        </div>
      </header>
      {!contentHasImg && images.length > 0 && (
        <div className={`mt-8 grid gap-3 ${images.length > 1 ? 'sm:grid-cols-2' : ''}`}>{images.map((im, i) => (
          <figure key={i}><img src={im.url} alt={im.caption || ''} className="w-full h-auto border border-sg-line" loading="lazy" />{im.caption && <figcaption className="text-[13px] text-sg-gray9 mt-1">{im.caption}</figcaption>}</figure>
        ))}</div>
      )}
      <div className="prose-sg mt-8 min-h-[120px]" dangerouslySetInnerHTML={{ __html: html || `<p class="text-sg-gray9">${ko ? '본문이 없습니다.' : 'No content.'}</p>` }} />
      {files.length > 0 && (
        <section className="mt-10 border border-sg-line p-5 bg-sg-mist/60">
          <p className="eyebrow">{T(l, 'attachments')}</p>
          <ul className="mt-3 space-y-2">{files.map((f, i) => <li key={i}><a href={f.url} download className="flex items-center gap-2 text-[15px] hover:text-sg-cardinal"><span className="text-sg-cardinal">↓</span>{f.name}{f.size ? <span className="text-[12px] text-sg-gray9">({Math.round(f.size / 1024)} KB)</span> : null}</a></li>)}</ul>
        </section>
      )}
      <nav className="mt-12 border-t border-b border-sg-line divide-y divide-sg-line text-[15px]">
        {next && <Link href={`/${l}/board/${board}/${next.id}`} className="flex gap-4 py-3.5 hover:text-sg-cardinal"><span className="w-14 shrink-0 text-sg-gray9">{ko ? '다음글' : 'Next'}</span><span className="truncate">{t(next, 'title', l)}</span></Link>}
        {prev && <Link href={`/${l}/board/${board}/${prev.id}`} className="flex gap-4 py-3.5 hover:text-sg-cardinal"><span className="w-14 shrink-0 text-sg-gray9">{ko ? '이전글' : 'Prev'}</span><span className="truncate">{t(prev, 'title', l)}</span></Link>}
      </nav>
      <p className="mt-8"><Link href={`/${l}/board/${board}`} className="btn-ghost">{T(l, 'list')}</Link></p>
    </article>
  </>);
}
