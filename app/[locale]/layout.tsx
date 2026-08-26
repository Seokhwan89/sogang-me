import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isLocale, locales } from '@/lib/i18n';

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  return (
    <>
      <Header locale={params.locale} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={params.locale} />
    </>
  );
}
