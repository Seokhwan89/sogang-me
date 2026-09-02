'use client';
import { useEffect } from 'react';

/** 루트 레이아웃의 <html lang="ko">를 현재 로케일로 맞춘다 (영문 페이지 접근성·SEO). */
export default function SetLang({ locale }: { locale: string }) {
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  return null;
}
