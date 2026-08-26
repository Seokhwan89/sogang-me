import Link from 'next/link';
import type { Locale } from '@/lib/i18n';

/**
 * Wordmark. Replace the emblem below with the official Sogang UI:
 * put `public/images/sogang-emblem.svg` in the repo and swap the <SogangEmblem/> for <img src="/images/sogang-emblem.svg" />.
 */
export function SogangEmblem({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={className} aria-hidden>
      <path d="M20 2 4 8v14c0 10 7 17 16 20 9-3 16-10 16-20V8L20 2z" fill="var(--sg-red)" />
      <path d="M20 6 8 10.5V22c0 7.5 5.2 12.9 12 15.5 6.8-2.6 12-8 12-15.5V10.5L20 6z" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".7" />
      <text x="20" y="26" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="600" fontSize="11" fill="#fff">IHS</text>
    </svg>
  );
}

export default function Logo({ locale, light = false }: { locale: Locale; light?: boolean }) {
  return (
    <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0" aria-label="Sogang University Mechanical Engineering">
      <SogangEmblem />
      <span className={`leading-tight ${light ? 'text-white' : 'text-sg-ink'}`}>
        <span className="block text-[11px] tracking-[0.12em] font-mono opacity-70">SOGANG UNIVERSITY</span>
        <span className="block text-[17px] font-bold tracking-tight">
          {locale === 'en' ? 'Mechanical Engineering' : '기계공학과'}
        </span>
      </span>
    </Link>
  );
}
