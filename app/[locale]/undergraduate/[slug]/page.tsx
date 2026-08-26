import StaticPage from '@/components/StaticPage';
import AcademicCalendar from '@/components/Calendar';
import type { Locale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
export const revalidate = 300;
const slugs = ['admission', 'curriculum', 'competency', 'calendar', 'activities', 'ureca'];
export default function UG({ params }: { params: { locale: Locale; slug: string } }) {
  if (!slugs.includes(params.slug)) notFound();
  if (params.slug === 'calendar') return <StaticPage locale={params.locale} section="undergraduate" slug="calendar"><AcademicCalendar locale={params.locale} /></StaticPage>;
  return <StaticPage locale={params.locale} section="undergraduate" slug={params.slug} />;
}
