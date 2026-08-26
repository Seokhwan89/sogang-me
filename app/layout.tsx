import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '서강대학교 기계공학과 | Sogang Mechanical Engineering', template: '%s | 서강대학교 기계공학과' },
  description: '서강대학교 기계공학과 — Department of Mechanical Engineering, Sogang University',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://me.sogang.ac.kr'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
