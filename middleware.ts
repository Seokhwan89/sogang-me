import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isLocale } from './lib/i18n';

const ADMIN_PATH = process.env.ADMIN_PATH || 'adm';

/** 옛 홈페이지(그누보드) URL → 새 사이트 경로 리다이렉트.
 *  구글 검색결과·외부 사이트(공과대학 등)에 남아 있는 옛 링크가 404가 되지 않게 한다. */
async function legacyRedirect(req: NextRequest): Promise<NextResponse | null> {
  const { pathname, searchParams } = req.nextUrl;
  const to = (path: string, permanent = true) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = '';
    return NextResponse.redirect(url, permanent ? 308 : 307);
  };

  // 옛 영문 홈 (/english, /english/…) → 새 영문 홈
  if (pathname === '/english' || pathname.startsWith('/english/')) return to('/en');
  if (pathname === '/index.php') return to('/');

  // 옛 게시판: /bbs/board.php, /v2/bbs/board.php
  if (pathname === '/bbs/board.php' || pathname === '/v2/bbs/board.php') {
    const tb = searchParams.get('bo_table') || '';
    const wr = searchParams.get('wr_id') || '';
    if (tb.startsWith('sub6_7')) return to('/ko/reservation'); // 시설 예약 달력
    if (tb && wr) {
      // 이관 때 저장한 legacy_id(g5:테이블:번호 / g4:…)로 새 게시글을 찾는다
      try {
        const r = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts?select=id,board&published=eq.true&or=(legacy_id.eq.g5:${tb}:${wr},legacy_id.eq.g4:${tb}:${wr})&limit=1`,
          { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` } },
        );
        const d = await r.json();
        if (Array.isArray(d) && d[0]) return to(`/ko/board/${d[0].board}/${d[0].id}`);
      } catch { /* DB 불통이면 아래 게시판 매핑으로 */ }
    }
    const tbMap: Record<string, string> = { sub6_1: 'notice', sub6_2: 'scholarship', sub6_3: 'events', sub6_4: 'gallery', sub6_5: 'archive' };
    if (tbMap[tb]) return to(`/ko/board/${tbMap[tb]}`);
    return to('/');
  }

  // 옛 메뉴 그룹 페이지: /bbs/group.php?gr_id=sub2, /bbs/group_eng.php?gr_id=eng_sub2 등
  if (pathname.startsWith('/bbs/') || pathname.startsWith('/v2/bbs/')) {
    const gr = searchParams.get('gr_id') || '';
    const eng = pathname.includes('group_eng') || gr.startsWith('eng');
    const n = (gr.match(/sub(\d)/) || [])[1];
    const secMap: Record<string, string> = { '1': '/about/intro', '2': '/faculty', '3': '/undergraduate/admission', '4': '/graduate/admission', '5': '/graduate/areas', '6': '/board/notice' };
    if (n && secMap[n]) return to(`/${eng ? 'en' : 'ko'}${secMap[n]}`);
    return to(eng ? '/en' : '/');
  }

  // 그 밖의 옛 경로(/v2/…, /kor/…)는 홈으로
  if (pathname === '/v2' || pathname.startsWith('/v2/') || pathname === '/kor' || pathname.startsWith('/kor/')) return to('/');
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const legacy = await legacyRedirect(req);
  if (legacy) return legacy;

  // 1) Secret admin URL -> internal /admin (direct /admin is blocked)
  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(`/${ADMIN_PATH}`, '/admin');
    const res = NextResponse.rewrite(url);
    // keep Supabase session fresh for admin pages
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: { name: string; value: string; options?: any }[]) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    });
    await supabase.auth.getUser();
    return res;
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return new NextResponse('Not found', { status: 404 });
  }

  // 2) Locale routing: /ko/... or /en/... ; otherwise detect
  const first = pathname.split('/')[1];
  if (isLocale(first)) {
    const res = NextResponse.next();
    res.cookies.set('locale', first, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }
  const cookie = req.cookies.get('locale')?.value;
  const country = req.headers.get('x-vercel-ip-country') || req.geo?.country || '';
  const accept = req.headers.get('accept-language') || '';
  let locale = 'ko';
  if (cookie && isLocale(cookie)) locale = cookie;
  else if (country) locale = country === 'KR' ? 'ko' : 'en';
  else if (accept && !accept.toLowerCase().startsWith('ko')) locale = 'en';
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    // 옛 사이트 리다이렉트 대상 (점(.)이 들어간 경로는 위 일반 매처에서 제외되므로 명시)
    '/bbs/:path*', '/v2/:path*', '/index.php', '/english/:path*',
  ],
};
