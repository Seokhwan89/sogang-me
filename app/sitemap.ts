import type { MetadataRoute } from 'next';
import { nav } from '@/lib/nav';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://me.sogang.ac.kr';
  const paths = ['', ...nav.flatMap((n) => (n.sub || []).map((s) => s.href))];
  return ['ko', 'en'].flatMap((l) => paths.map((p) => ({ url: `${base}/${l}${p}`, changeFrequency: 'weekly' as const })));
}
