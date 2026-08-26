import Link from 'next/link';
import { nav, label } from '@/lib/nav';
import { T, type Locale } from '@/lib/i18n';

export default function PageHero({ locale, section, current, title }: { locale: Locale; section: string; current?: string; title?: string }) {
  const sec = nav.find((n) => n.id === section);
  const cur = sec?.sub?.find((s) => s.id === current);
  const heading = title || (cur ? label(cur, locale) : sec ? label(sec, locale) : '');
  return (
    <>
      <section className="relative bg-sg-ink text-white pt-[72px]">
        <div className="absolute inset-0 opacity-[.18]" style={{ backgroundImage: 'linear-gradient(var(--sg-line) 1px, transparent 1px), linear-gradient(90deg, var(--sg-line) 1px, transparent 1px)', backgroundSize: '48px 48px' }} aria-hidden />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-sg-red/40 to-transparent" aria-hidden />
        <div className="container-site relative py-16 md:py-20">
          <p className="eyebrow !text-white/60">{sec ? label(sec, locale) : ''}</p>
          <h1 className="h-display mt-2">{heading}</h1>
        </div>
      </section>
      <div className="border-b border-sg-line bg-white">
        <div className="container-site flex items-center gap-2 py-3 text-[13px] text-sg-steel overflow-x-auto">
          <Link href={`/${locale}`} className="hover:text-sg-red">{T(locale, 'home')}</Link>
          {sec && <><span className="font-mono">/</span><span>{label(sec, locale)}</span></>}
          {cur && <><span className="font-mono">/</span><span className="text-sg-ink font-medium">{label(cur, locale)}</span></>}
        </div>
      </div>
      {sec?.sub && (
        <div className="border-b border-sg-line bg-white sticky top-[72px] z-30">
          <div className="container-site flex gap-1 overflow-x-auto">
            {sec.sub.map((s) => (
              <Link key={s.id} href={`/${locale}${s.href}`} className={`whitespace-nowrap px-4 py-3 text-[14px] border-b-2 -mb-px ${s.id === current ? 'border-sg-red text-sg-red font-semibold' : 'border-transparent text-sg-steel hover:text-sg-ink'}`}>
                {label(s, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
