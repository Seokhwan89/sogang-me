import Link from 'next/link';
import { T, type Locale } from '@/lib/i18n';
import { DesignEmblem, ThermalEmblem, ControlEmblem, ManufacturingEmblem } from './FieldEmblems';
import { areas } from '@/content/areas';
import HeroRotator from './HeroRotator';

const Em = [DesignEmblem, ThermalEmblem, ControlEmblem, ManufacturingEmblem];

export default function HeroVideo({ locale, videoUrl, poster, taglineKo, taglineEn, fieldVideos }: { locale: Locale; videoUrl?: string; poster?: string; taglineKo?: string | null; taglineEn?: string | null; fieldVideos?: { src: string; poster: string }[] }) {
  const ko = locale === 'ko';
  const tagline = ko ? taglineKo : taglineEn;
  return (
    <section className="relative min-h-[100svh] bg-sg-ink text-white overflow-hidden pt-[80px]">
      {/* Background: 관리자가 지정한 영상 > 4개 분야 영상 순환 > 정적 이미지 순 */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster={poster} preload="metadata">
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : fieldVideos?.length ? (
          <HeroRotator videos={fieldVideos} />
        ) : (
          <img src={poster} alt="" className="w-full h-full object-cover kenburns" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,26,26,.82)_0%,rgba(139,30,36,.55)_45%,rgba(26,26,26,.35)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-sg-ink to-transparent" />
      </div>

      <div className="container-site relative flex flex-col justify-center min-h-[calc(100svh-80px)] py-16">
        <p className="rise rise-1 text-[15px] md:text-[17px] font-semibold tracking-[0.12em] text-white/80">
          {ko ? 'SOGANG UNIVERSITY · 기계공학과' : 'SOGANG UNIVERSITY · MECHANICAL ENGINEERING'}
        </p>
        <h1 className="mt-5 max-w-4xl font-brand text-[2.6rem] sm:text-[3.6rem] lg:text-[4.6rem] leading-[1.12]">
          {tagline ? <span className="block rise rise-2">{tagline}</span> : (
            <><span className="block rise rise-2">{T(locale, 'hero1')}</span><span className="block rise rise-3">{T(locale, 'hero2')}</span></>
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] md:text-[19px] leading-relaxed text-white/85 rise rise-4">{T(locale, 'heroSub')}</p>
        <div className="mt-9 flex flex-wrap gap-3 rise rise-4">
          <Link href={`/${locale}/undergraduate/admission`} className="btn-primary">{T(locale, 'ugAdmission')}</Link>
          <Link href={`/${locale}/graduate/admission`} className="btn-light">{T(locale, 'gradAdmission')}</Link>
          <Link href={`/${locale}/faculty`} className="btn-light">{T(locale, 'professors')}</Link>
        </div>

        {/* Four fields strip */}
        <div className="mt-14 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 border border-white/15 backdrop-blur-sm rise rise-4">
          {areas.map((a, i) => { const E = Em[i]; return (
            <Link key={a.id} href={`/${locale}/graduate/areas#${a.id}`} className="group bg-sg-ink/40 hover:bg-sg-cardinal/80 transition-colors p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <E className="w-[64px] h-[44px] md:w-[92px] md:h-[64px] shrink-0 text-white/90" />
              <div className="min-w-0">
                <p className="font-bold text-[15px] md:text-[17px] leading-tight break-keep">{ko ? a.ko : a.en}</p>
                {ko && <p className="mt-1 text-[12px] md:text-[12.5px] text-white/60 break-keep group-hover:text-white/85">{a.en}</p>}
              </div>
            </Link>
          ); })}
        </div>
      </div>
      <a href="#areas" className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60 hover:text-white flex flex-col items-center gap-1 text-[11px] tracking-[.3em]">SCROLL<span className="floaty">↓</span></a>
    </section>
  );
}
