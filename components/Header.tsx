'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { nav, label } from '@/lib/nav';
import type { Locale } from '@/lib/i18n';

function Flag({ code }: { code: 'ko' | 'en' }) {
  if (code === 'ko') return (
    <svg viewBox="0 0 24 16" className="w-5 h-[14px] rounded-[2px]" aria-hidden>
      <rect width="24" height="16" fill="#fff" />
      <circle cx="12" cy="8" r="4" fill="#cd2e3a" />
      <path d="M8.2 6.4a4 4 0 0 0 7.6 3.2 2 2 0 0 1-3.8-1.6 2 2 0 0 0-3.8-1.6z" fill="#0047a0" />
      <g stroke="#000" strokeWidth=".8"><path d="M3.5 3.2l2-1.2M3 4l2-1.2M4 4.8l2-1.2M18.5 11.8l2 1.2M18 12.6l2 1.2M17.5 13.4l2 1.2M3.5 12.8l2 1.2M4 12l2 1.2M3 13.6l2 1.2M18.5 4.2l2-1.2M18 3.4l2-1.2M19 5l2-1.2" /></g>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 16" className="w-5 h-[14px] rounded-[2px]" aria-hidden>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="2.6" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2" />
    </svg>
  );
}

export default function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState<string | null>(null);
  const other: Locale = locale === 'ko' ? 'en' : 'ko';
  const switchHref = pathname.replace(/^\/(ko|en)/, `/${other}`);
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  const solid = scrolled || !isHome || open;
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? 'bg-white/95 backdrop-blur border-b border-sg-line' : 'bg-transparent'}`}>
      <div className="container-site h-[72px] flex items-center justify-between gap-6">
        <Logo locale={locale} light={!solid} />
        <nav className="hidden lg:flex items-center gap-1 h-full" aria-label="Main">
          {nav.map((item) => (
            <div key={item.id} className="group relative h-full flex items-center">
              <Link href={`/${locale}${item.href}`} className={`px-4 py-2 text-[15px] font-semibold tracking-tight ${solid ? 'text-sg-ink' : 'text-white'} relative after:absolute after:left-4 after:right-4 after:-bottom-0.5 after:h-[2px] after:bg-sg-red after:scale-x-0 after:origin-left after:transition-transform group-hover:after:scale-x-100`}>
                {label(item, locale)}
              </Link>
              {item.sub && (
                <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                  <ul className="min-w-[220px] bg-white border border-sg-line shadow-[0_20px_40px_-20px_rgba(0,0,0,.25)] py-2">
                    {item.sub.map((s) => (
                      <li key={s.id}>
                        <Link href={`/${locale}${s.href}`} className="block px-4 py-2 text-[14px] text-sg-ink hover:bg-sg-mist hover:text-sg-red">{label(s, locale)}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={switchHref} className={`flex items-center gap-2 px-3 py-1.5 border text-[12px] font-mono font-medium tracking-wider ${solid ? 'border-sg-line text-sg-ink hover:border-sg-ink' : 'border-white/40 text-white hover:border-white'}`} aria-label={other === 'en' ? 'Switch to English' : '한국어로 전환'}>
            <Flag code={other} /> {other.toUpperCase()}
          </Link>
          <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 ${solid ? 'text-sg-ink' : 'text-white'}`} aria-label="Menu" aria-expanded={open}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-sg-line max-h-[calc(100vh-72px)] overflow-y-auto">
          {nav.map((item) => (
            <div key={item.id} className="border-b border-sg-line">
              <button className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold" onClick={() => setMobile(mobile === item.id ? null : item.id)} aria-expanded={mobile === item.id}>
                {label(item, locale)}
                <span className={`font-mono text-sg-steel transition-transform ${mobile === item.id ? 'rotate-45' : ''}`}>+</span>
              </button>
              {mobile === item.id && item.sub && (
                <ul className="bg-sg-mist pb-2">
                  {item.sub.map((s) => (
                    <li key={s.id}><Link href={`/${locale}${s.href}`} className="block px-8 py-2.5 text-[14px]">{label(s, locale)}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
