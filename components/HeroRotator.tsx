'use client';
import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 5500;

/** 홈 히어로 배경: 4개 분야 영상을 랜덤 순서로 5초 남짓 간격 크로스페이드 순환.
 *  아래 CSS 전용 포스터 슬라이드쇼가 항상 깔려 있어, JS 하이드레이션 실패·자동재생 차단·
 *  OS 모션 축소 등 어떤 환경에서도 최소한 정지 화면에 갇히지는 않는다. */
export default function HeroRotator({ videos }: { videos: { src: string; poster: string }[] }) {
  const [order, setOrder] = useState<number[] | null>(null);
  const [pos, setPos] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // 순서 셔플은 클라이언트에서만 (SSR 마크업 불일치 방지)
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
      {/* CSS 전용 포스터 슬라이드쇼 (JS 없이도 22초 주기로 4장 순환) */}
      {videos.map((v, i) => (
        <img key={v.poster} src={v.poster} alt="" className="hero-fade absolute inset-0 w-full h-full object-cover" style={{ animationDelay: `${i * 5.5 - 22}s` }} />
      ))}
      {/* JS가 살아 있으면 영상 레이어가 위에서 재생·순환 */}
      {order && videos.map((v, i) => (
        <video key={v.src} ref={(el) => { refs.current[i] = el; }} src={v.src} autoPlay muted playsInline loop preload={i === order[0] ? 'auto' : 'metadata'} poster={v.poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </div>
  );
}
