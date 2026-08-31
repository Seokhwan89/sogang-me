'use client';
import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 5500;

/** 홈 히어로 배경: 4개 분야 영상을 랜덤 순서로 5초 남짓 간격 크로스페이드 순환. */
export default function HeroRotator({ videos }: { videos: { src: string; poster: string }[] }) {
  const [order, setOrder] = useState<number[] | null>(null);
  const [pos, setPos] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // 순서 셔플은 클라이언트에서만 (SSR 마크업 불일치 방지)
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const idx = videos.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    setOrder(idx);
  }, [videos.length]);

  useEffect(() => {
    if (!order || order.length < 2) return;
    const t = setInterval(() => setPos((p) => p + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [order]);

  const active = order ? order[pos % order.length] : -1;

  useEffect(() => {
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) { try { v.currentTime = 0; } catch {} v.play().catch(() => {}); }
      else v.pause();
    });
  }, [active]);

  return (
    <div className="absolute inset-0">
      {/* 영상 로드 전·모션 축소 환경: 첫 포스터 */}
      <img src={videos[0]?.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {order && videos.map((v, i) => (
        <video key={v.src} ref={(el) => { refs.current[i] = el; }} src={v.src} autoPlay muted playsInline loop preload={i === order[0] ? 'auto' : 'metadata'} poster={v.poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </div>
  );
}
