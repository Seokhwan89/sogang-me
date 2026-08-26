import Link from 'next/link';
import { t, T, type Locale } from '@/lib/i18n';

export type Post = {
  id: number; board: string; title_ko: string; title_en?: string | null; excerpt_ko?: string | null; excerpt_en?: string | null;
  thumbnail_url?: string | null; created_at: string; is_pinned?: boolean; view_count?: number; author?: string | null;
  content_ko?: string | null; content_en?: string | null; attachments?: any[]; images?: any[];
};

export const fmtDate = (d: string) => new Date(d).toISOString().slice(0, 10).replace(/-/g, '.');

export default function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const tag = T(locale, post.board as any) || post.board;
  return (
    <Link href={`/${locale}/board/${post.board}/${post.id}`} className="card group flex flex-col overflow-hidden">
      <div className="aspect-[16/10] bg-sg-mist relative overflow-hidden">
        {post.thumbnail_url ? (
          <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[11px] tracking-[.2em] text-sg-steel/60 uppercase">{tag}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 bg-sg-red text-white font-mono text-[10px] tracking-wider px-2 py-1">{tag}</span>
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-sg-red transition-colors">{t(post, 'title', locale)}</h3>
        {t(post, 'excerpt', locale) && <p className="text-[13px] text-sg-steel line-clamp-2">{t(post, 'excerpt', locale)}</p>}
        <span className="mt-auto pt-2 font-mono text-[11px] text-sg-steel">{fmtDate(post.created_at)}</span>
      </div>
    </Link>
  );
}
