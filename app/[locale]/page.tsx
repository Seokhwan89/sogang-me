import Link from 'next/link';
import Linkage from '@/components/Linkage';
import NewsTabs from '@/components/NewsTabs';
import Reveal from '@/components/Reveal';
import { getHomeData } from '@/lib/data';
import { T, t, type Locale } from '@/lib/i18n';
import { areas } from '@/content/areas';

export const revalidate = 60;

export default async function Home({ params }: { params: { locale: Locale } }) {
  const l = params.locale;
  const ko = l === 'ko';
  const { groups, gallery, banners, settings } = await getHomeData();
  const sections: string[] = settings.sections || ['hero', 'intro', 'news', 'quicklinks', 'programs', 'gallery'];
  const on = (s: string) => sections.includes(s);

  const quick = [
    { k: 'seminar', href: '/reservation?f=seminar' }, { k: 'meeting', href: '/reservation?f=meeting' },
    { k: 'drafting', href: '/reservation?f=drafting' }, { k: 'server', href: '/reservation?f=server1' },
  ] as const;
  const programs = [
    { k: 'ug', d: 'ugDesc', href: '/undergraduate/admission', code: 'UG' },
    { k: 'grad', d: 'gradDesc', href: '/graduate/admission', code: 'GR' },
    { k: 'ureca', d: 'urecaDesc', href: '/undergraduate/ureca', code: 'UR' },
    { k: 'industry', d: 'industryDesc', href: '/industry/samsung', code: 'IN' },
  ] as const;

  return (
    <>
      {on('hero') && (
        <section className="relative bg-sg-ink text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_30%,rgba(182,0,5,.35),transparent_70%)]" aria-hidden />
          <div className="container-site relative min-h-[100svh] grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 pt-[100px] pb-16">
            <div>
              <p className="eyebrow rise rise-1 !text-white/60">{ko ? '서강대학교 기계공학과' : 'Department of Mechanical Engineering · Sogang University'}</p>
              <h1 className="mt-4 text-[2.6rem] sm:text-[3.4rem] lg:text-[4.2rem] font-bold leading-[1.05] tracking-[-0.03em]">
                <span className="block rise rise-2">{settings.tagline_ko && ko ? settings.tagline_ko : settings.tagline_en && !ko ? settings.tagline_en : T(l, 'hero1')}</span>
                {!(settings.tagline_ko || settings.tagline_en) && <span className="block rise rise-3 text-sg-red">{T(l, 'hero2')}</span>}
              </h1>
              <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-white/70 rise rise-4">{T(l, 'heroSub')}</p>
              <div className="mt-8 flex flex-wrap gap-3 rise rise-4">
                <Link href={`/${l}/undergraduate/admission`} className="btn-primary">{T(l, 'ugAdmission')}</Link>
                <Link href={`/${l}/graduate/admission`} className="btn border border-white/40 text-white hover:bg-white hover:text-sg-ink">{T(l, 'gradAdmission')}</Link>
              </div>
              <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg rise rise-4">
                {[['1993', T(l, 'since')], ['18', T(l, 'labs')], ['BK21', T(l, 'bk21')]].map(([v, k]) => (
                  <div key={k} className="border-l border-white/20 pl-4">
                    <dt className="font-mono text-2xl font-medium">{v}</dt>
                    <dd className="text-[12px] text-white/55 mt-1">{k}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative aspect-[480/340] max-h-[440px] w-full">
              <Linkage />
            </div>
          </div>
          <a href="#intro" className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[.3em] text-white/50 hover:text-white">SCROLL</a>
        </section>
      )}

      {banners.length > 0 && (
        <section className="container-site -mt-8 relative z-10 grid gap-4 md:grid-cols-3">
          {banners.slice(0, 3).map((b: any) => (
            <a key={b.id} href={b.link || '#'} className="card p-5 flex items-center gap-4">
              {b.image_url && <img src={b.image_url} alt="" className="w-14 h-14 object-cover" />}
              <div><p className="font-semibold">{t(b, 'title', l)}</p><p className="text-[13px] text-sg-steel">{t(b, 'subtitle', l)}</p></div>
            </a>
          ))}
        </section>
      )}

      {on('intro') && (
        <section id="intro" className="container-site py-24">
          <Reveal>
            <p className="eyebrow">{T(l, 'areasTitle')}</p>
            <h2 className="h-section mt-3 max-w-2xl">
              {ko ? '네 개의 기초 분야, 열여덟 개의 연구실이 만드는 융합' : 'Four foundations, eighteen labs, one convergence'}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px bg-sg-line md:grid-cols-2 lg:grid-cols-4 border border-sg-line">
            {areas.map((a, i) => (
              <Reveal key={a.id} delay={i * 80} className="bg-white">
                <Link href={`/${l}/graduate/areas#${a.id}`} className="group block p-7 h-full hover:bg-sg-mist transition-colors">
                  <span className="font-mono text-[11px] text-sg-red tracking-wider">{a.code}</span>
                  <h3 className="mt-3 text-lg font-bold leading-snug group-hover:text-sg-red transition-colors">{ko ? a.ko : a.en}</h3>
                  <p className="mt-3 text-[13.5px] text-sg-steel leading-relaxed">{ko ? a.descKo : a.descEn}</p>
                  <p className="mt-5 font-mono text-[11px] text-sg-steel">{a.labs} {ko ? '연구실' : 'labs'}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {on('news') && (
        <section className="bg-sg-mist py-24">
          <div className="container-site">
            <Reveal><p className="eyebrow">{T(l, 'newsTitle')}</p><h2 className="h-section mt-3 mb-10">{ko ? '최근 소식과 성과' : 'Latest news and achievements'}</h2></Reveal>
            <NewsTabs locale={l} groups={groups} />
          </div>
        </section>
      )}

      {on('quicklinks') && (
        <section className="container-site py-20">
          <Reveal>
            <div className="grid gap-px bg-sg-ink border border-sg-ink lg:grid-cols-[auto_1fr]">
              <div className="bg-sg-ink text-white p-7 lg:w-64">
                <p className="eyebrow !text-white/60">{T(l, 'quick')}</p>
                <p className="mt-2 text-xl font-bold">{ko ? '시설 예약 현황' : 'Facility booking'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-sg-line">
                {quick.map((q) => (
                  <Link key={q.k} href={`/${l}${q.href}`} className="bg-white p-6 hover:bg-sg-red hover:text-white transition-colors group">
                    <span className="font-mono text-[10px] tracking-wider opacity-60">{q.k.toUpperCase()}</span>
                    <p className="mt-2 font-semibold">{T(l, q.k)}</p>
                    <span className="mt-4 block text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {on('programs') && (
        <section className="container-site pb-24">
          <Reveal><p className="eyebrow">{T(l, 'programsTitle')}</p><h2 className="h-section mt-3 mb-10">{ko ? '학부에서 대학원, 그리고 산업 현장까지' : 'From undergraduate to graduate to industry'}</h2></Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {programs.map((p, i) => (
              <Reveal key={p.k} delay={i * 80}>
                <Link href={`/${l}${p.href}`} className="card group block p-7 h-full border-t-2 border-t-sg-ink hover:border-t-sg-red">
                  <span className="font-mono text-[11px] tracking-wider text-sg-steel">{p.code}</span>
                  <h3 className="mt-4 text-xl font-bold group-hover:text-sg-red transition-colors">{T(l, p.k)}</h3>
                  <p className="mt-2 text-[13.5px] text-sg-steel leading-relaxed">{T(l, p.d)}</p>
                  <span className="mt-6 inline-block font-mono text-[12px]">{T(l, 'readMore')} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Link href={`/${l}/board/scholarship`} className="card p-6 flex items-center justify-between hover:border-sg-red">
              <span className="font-semibold">{T(l, 'scholarship')}</span><span className="font-mono text-sg-red">→</span>
            </Link>
            <Link href={`/${l}/board/gallery`} className="card p-6 flex items-center justify-between hover:border-sg-red">
              <span className="font-semibold">{T(l, 'gallery')}</span><span className="font-mono text-sg-red">→</span>
            </Link>
          </div>
        </section>
      )}

      {on('gallery') && gallery.length > 0 && (
        <section className="bg-sg-ink text-white py-20">
          <div className="container-site">
            <div className="flex items-end justify-between mb-8">
              <div><p className="eyebrow !text-white/60">{T(l, 'galleryTitle')}</p><h2 className="h-section mt-3">{ko ? '학과의 순간들' : 'Moments'}</h2></div>
              <Link href={`/${l}/board/gallery`} className="font-mono text-[12px] text-white/60 hover:text-white">{T(l, 'more')} →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {gallery.map((g: any, i: number) => (
                <Link key={g.id} href={`/${l}/board/gallery/${g.id}`} className={`relative overflow-hidden bg-white/5 group ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                  {(g.thumbnail_url || g.images?.[0]?.url) ? <img src={g.thumbnail_url || g.images[0].url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 grid place-items-center p-3 text-center text-[12px] text-white/60">{t(g, 'title', l)}</div>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
