'use client';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { fmtDate, type Post } from './PostCard';
import { t, T, type Locale } from '@/lib/i18n';
import { coverFor } from '@/lib/placeholder';

function Arrow({ dir, onClick, disabled }: { dir: 'l' | 'r'; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={dir === 'l' ? 'previous' : 'next'}
      className="w-11 h-11 grid place-items-center border border-sg-line bg-white text-sg-ink hover:bg-sg-cardinal hover:border-sg-cardinal hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-sg-ink transition-colors">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{dir === 'l' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}</svg>
    </button>
  );
}

function Row({ locale, board, posts, variant }: { locale: Locale; board: string; posts: Post[]; variant: 'text' | 'image' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ start: true, end: false });
  const ko = locale === 'ko';
  const update = () => { const el = ref.current; if (!el) return; setPos({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 }); };
  useEffect(() => { update(); const el = ref.current; el?.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); return () => { el?.removeEventListener('scroll', update); window.removeEventListener('resize', update); }; }, []);
  const step = (d: number) => { const el = ref.current; if (!el) return; const card = el.querySelector<HTMLElement>('[data-card]'); const w = card ? card.offsetWidth + 20 : 320; el.scrollBy({ left: d * w, behavior: 'smooth' }); };
  const titles: Record<string, [string, string]> = { notice: ['공지사항', 'Notice'], research: ['연구성과', 'Research Highlights'], award: ['수상', 'Awards & Honors'] };
  const subs: Record<string, [string, string]> = { notice: ['학사·장학·행사 안내', 'Academic and event notices'], research: ['논문·과제·연구 소식', 'Papers, projects and research news'], award: ['학생·교수 수상 소식', 'Student and faculty honors'] };
  return (
    <div className="py-10 first:pt-0 border-b border-sg-line last:border-0">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h3 className="font-brand text-[1.7rem] md:text-[2.1rem] leading-none">{ko ? titles[board][0] : titles[board][1]}</h3>
          <p className="mt-2 text-[14px] text-sg-gray9">{ko ? subs[board][0] : subs[board][1]}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/board/${board}`} className="hidden sm:inline-flex items-center gap-1 mr-2 text-[14px] font-semibold text-sg-gray11 hover:text-sg-cardinal">{T(locale, 'more')} <span aria-hidden>+</span></Link>
          <Arrow dir="l" onClick={() => step(-1)} disabled={pos.start} /><Arrow dir="r" onClick={() => step(1)} disabled={pos.end} />
        </div>
      </div>
      {posts.length === 0 ? <p className="py-10 text-center text-sg-gray9 border border-dashed border-sg-line">{T(locale, 'noPosts')}</p> : (
        <div ref={ref} className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          {posts.map((p, i) => {
            const img = p.thumbnail_url || (p.images && p.images[0]?.url);
            const cover = img || coverFor(board, p.title_ko, p.id);
            return (
              <Link key={p.id} data-card href={`/${locale}/board/${board}/${p.id}`} className="card group snap-start shrink-0 w-[78vw] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)] flex flex-col overflow-hidden">
                {variant === 'image' ? (
                  <div className="aspect-[16/10] overflow-hidden bg-sg-mist"><img src={cover} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" /></div>
                ) : (
                  <div className="h-2 bg-sg-cardinal group-hover:bg-sg-deep" />
                )}
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  {p.is_pinned && <span className="self-start mb-2 text-[11px] font-bold text-white bg-sg-cardinal px-2 py-0.5">{ko ? '중요' : 'PINNED'}</span>}
                  <h4 className={`font-bold leading-snug group-hover:text-sg-cardinal transition-colors ${variant === 'text' ? 'text-[17px] line-clamp-3' : 'text-[16px] line-clamp-2'}`}>{t(p, 'title', locale)}</h4>
                  {variant === 'text' && t(p, 'excerpt', locale) && <p className="mt-3 text-[14px] leading-relaxed text-sg-gray11 line-clamp-3">{t(p, 'excerpt', locale)}</p>}
                  {variant === 'image' && t(p, 'excerpt', locale) && <p className="mt-2 text-[13.5px] leading-relaxed text-sg-gray11 line-clamp-2">{t(p, 'excerpt', locale)}</p>}
                  <div className="mt-auto pt-4 flex items-center justify-between text-[13px] text-sg-gray9">
                    <span>{fmtDate(p.created_at)}</span><span className="text-sg-cardinal font-semibold opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NewsRows({ locale, groups }: { locale: Locale; groups: Record<string, Post[]> }) {
  return (
    <div>
      <Row locale={locale} board="notice" posts={groups.notice || []} variant="text" />
      <Row locale={locale} board="research" posts={groups.research || []} variant="image" />
      <Row locale={locale} board="award" posts={groups.award || []} variant="image" />
    </div>
  );
}
