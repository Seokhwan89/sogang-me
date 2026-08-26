import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isLocale } from './lib/i18n';

const ADMIN_PATH = process.env.ADMIN_PATH || 'adm';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Secret admin URL -> internal /admin (direct /admin is blocked)
  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(`/${ADMIN_PATH}`, '/admin');
    const res = NextResponse.rewrite(url);
    // keep Supabase session fresh for admin pages
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
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
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
