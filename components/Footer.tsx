import Link from 'next/link';
import Logo from './Logo';
import { T, type Locale } from '@/lib/i18n';

export default function Footer({ locale }: { locale: Locale }) {
  const ko = locale === 'ko';
  return (
    <footer className="bg-sg-ink text-white mt-24">
      <div className="container-site py-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo locale={locale} light />
          <p className="mt-6 text-[13px] leading-relaxed text-white/60 max-w-sm">
            {ko ? '04107 서울특별시 마포구 백범로 35 리치과학관 618호' : 'Ricci Hall 618, 35 Baekbeom-ro, Mapo-gu, Seoul 04107, Korea'}
          </p>
          <p className="mt-2 font-mono text-[12px] text-white/60">
            {T(locale, 'tel')} 02-705-8631 · {T(locale, 'fax')} 02-712-0799
          </p>
        </div>
        <div>
          <p className="eyebrow !text-white/50">{T(locale, 'quick')}</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li><a href="https://www.sogang.ac.kr" target="_blank" rel="noreferrer" className="hover:text-sg-red">{ko ? '서강대학교' : 'Sogang University'}</a></li>
            <li><a href="https://admission.sogang.ac.kr" target="_blank" rel="noreferrer" className="hover:text-sg-red">{ko ? '입학처' : 'Admissions'}</a></li>
            <li><a href="https://gradsch.sogang.ac.kr" target="_blank" rel="noreferrer" className="hover:text-sg-red">{ko ? '대학원' : 'Graduate School'}</a></li>
            <li><a href="https://saint.sogang.ac.kr" target="_blank" rel="noreferrer" className="hover:text-sg-red">SAINT</a></li>
            <li><a href="https://library.sogang.ac.kr" target="_blank" rel="noreferrer" className="hover:text-sg-red">{ko ? '로욜라도서관' : 'Loyola Library'}</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-white/50">{ko ? '정책' : 'Policies'}</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li><Link href={`/${locale}/policy/privacy`} className="hover:text-sg-red">{T(locale, 'privacy')}</Link></li>
            <li><Link href={`/${locale}/policy/email`} className="hover:text-sg-red">{T(locale, 'emailPolicy')}</Link></li>
            <li><Link href={`/${locale}/policy/terms`} className="hover:text-sg-red">{T(locale, 'terms')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-wrap justify-between gap-2 font-mono text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} Department of Mechanical Engineering, Sogang University</span>
          <span>BK21 FOUR · Since 1993</span>
        </div>
      </div>
    </footer>
  );
}
