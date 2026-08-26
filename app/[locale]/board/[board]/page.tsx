import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PostCard, { fmtDate } from '@/components/PostCard';
import { getPosts } from '@/lib/data';
import { boards } from '@/lib/nav';
import { t, T, type Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 60;
const PER = 15;

export default async function BoardList({ params, searchParams }: { params: { locale: Locale; board: string }; searchParams: { page?: string; q?: string } }) {
  const { locale: l, board } = params; const ko = l === 'ko';
  if (!(boards as readonly string[]).includes(board)) notFound();
  const page = Math.max(1, Number(searchParams.page || 1)); const q = searchParams.q || '';
  const { posts, total } = await getPosts(board, page, PER, q);
  const pages = Math.max(1, Math.ceil(total / PER));
  const isGallery = board === 'gallery';
  const section = board === 'alumni_news' ? 'alumni' : 'board';
  const current = board === 'alumni_news' ? 'news' : board;
  const href = (p: number) => `/${l}/board/${board}?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  return (<>
    <PageHero locale={l} section={section} current={current} />
    <div className="container-site py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="font-mono text-[12px] text-sg-steel">{ko ? `총 ${total}건` : `${total} posts`}</p>
        <form className="flex gap-0" action={`/${l}/board/${board}`}>
          <input name="q" defaultValue={q} placeholder={T(l, 'search')} className="input !w-56" />
          <button className="btn-primary !py-2">{T(l, 'search')}</button>
        </form>
      </div>
      {posts.length === 0 ? <p className="py-16 text-center text-sg-steel border border-dashed border-sg-line">{T(l, 'noPosts')}</p> : isGallery ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{posts.map((p) => <PostCard key={p.id} post={{ ...p, thumbnail_url: p.thumbnail_url || p.images?.[0]?.url }} locale={l} />)}</div>
      ) : (
        <table className="w-full text-[14px] border-t-2 border-sg-ink">
          <thead className="hidden md:table-header-group"><tr className="text-[12px] font-mono uppercase tracking-wider text-sg-steel border-b border-sg-line">
            <th className="py-3 w-16 text-left">No.</th><th className="py-3 text-left">{ko ? '제목' : 'Title'}</th><th className="py-3 w-28 text-left">{T(l, 'author')}</th><th className="py-3 w-28 text-left">{T(l, 'date')}</th><th className="py-3 w-16 text-right">{T(l, 'views')}</th></tr></thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={p.id} className={`border-b border-sg-line ${p.is_pinned ? 'bg-sg-mist/70' : ''}`}>
                <td className="py-3 pr-2 font-mono text-[12px] text-sg-steel hidden md:table-cell">{p.is_pinned ? <span className="text-sg-red font-semibold">{ko ? '공지' : 'PIN'}</span> : total - (page - 1) * PER - i}</td>
                <td className="py-3 pr-3">
                  <Link href={`/${l}/board/${board}/${p.id}`} className="font-medium hover:text-sg-red line-clamp-2">
                    {p.is_pinned && <span className="md:hidden font-mono text-[11px] text-sg-red mr-2">{ko ? '공지' : 'PIN'}</span>}{t(p, 'title', l)}
                    {(p.attachments?.length ?? 0) > 0 && <span className="ml-2 font-mono text-[11px] text-sg-steel">📎</span>}
                  </Link>
                  <span className="md:hidden block font-mono text-[11px] text-sg-steel mt-1">{fmtDate(p.created_at)}</span>
                </td>
                <td className="py-3 pr-3 text-sg-steel hidden md:table-cell">{p.author}</td>
                <td className="py-3 pr-3 font-mono text-[12px] text-sg-steel hidden md:table-cell">{fmtDate(p.created_at)}</td>
                <td className="py-3 text-right font-mono text-[12px] text-sg-steel hidden md:table-cell">{p.view_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {pages > 1 && (
        <nav className="mt-10 flex justify-center gap-1 font-mono text-[13px]" aria-label="Pagination">
          {page > 1 && <Link href={href(page - 1)} className="px-3 py-2 border border-sg-line hover:border-sg-ink">‹</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 3 || p === 1 || p === pages).map((p, i, arr) => (
            <span key={p} className="flex">
              {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 py-2 text-sg-steel">…</span>}
              <Link href={href(p)} className={`px-3 py-2 border ${p === page ? 'bg-sg-ink text-white border-sg-ink' : 'border-sg-line hover:border-sg-ink'}`}>{p}</Link>
            </span>
          ))}
          {page < pages && <Link href={href(page + 1)} className="px-3 py-2 border border-sg-line hover:border-sg-ink">›</Link>}
        </nav>
      )}
    </div>
  </>);
}
