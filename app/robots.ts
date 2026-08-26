import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', `/${process.env.ADMIN_PATH || 'adm'}`] }, sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://me.sogang.ac.kr'}/sitemap.xml` };
}
