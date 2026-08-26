import Link from 'next/link';
import { t, T, type Locale } from '@/lib/i18n';

export default function FacultyCard({ f, locale }: { f: any; locale: Locale }) {
  const ko = locale === 'ko';
  const initials = (f.name_en || f.name_ko || '?').split(/[\s-]/).map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Link href={`/${locale}/faculty/${f.id}`} className="card group flex gap-5 p-5">
      <div className="w-[88px] h-[104px] shrink-0 bg-sg-mist overflow-hidden grid place-items-center">
        {f.photo_url ? <img src={f.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="font-mono text-lg text-sg-steel/50">{initials}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-tight group-hover:text-sg-red transition-colors">
          {t(f, 'name', locale)} <span className="text-[13px] font-normal text-sg-steel">{t(f, 'title', locale)}</span>
        </h3>
        {f.name_en && ko && <p className="font-mono text-[11px] text-sg-steel">{f.name_en}</p>}
        <p className="mt-2 text-[13.5px] leading-snug">{t(f, 'lab', locale)}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12.5px] text-sg-steel">
          {f.office && <><dt className="font-mono">{T(locale, 'office')}</dt><dd className="truncate">{f.office}</dd></>}
          {f.tel && <><dt className="font-mono">{T(locale, 'tel')}</dt><dd className="font-mono">{f.tel}</dd></>}
          {f.email && <><dt className="font-mono">{T(locale, 'email')}</dt><dd className="truncate">{f.email}</dd></>}
        </dl>
      </div>
    </Link>
  );
}
