'use client';
import { useEffect, useRef, useState } from 'react';

const INTERVAL_MS = 5500;

type HeroVideoItem = { src: string; poster: string; field?: string };

/** 분야별 그룹을 각각 섞은 뒤 라운드로빈으로 끼워 넣는다 — 같은 분야가 연속으로 나오지 않게. */
function interleavedOrder(videos: HeroVideoItem[]) {
  const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const groups = new Map<string, number[]>();
  videos.forEach((v, i) => { const k = v.field ?? String(i); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(i); });
  const fields = shuffle([...groups.keys()]);
  const members = fields.map((f) => shuffle(groups.get(f)!));
  const out: number[] = [];
  const rounds = Math.max(...members.map((m) => m.length));
  for (let r = 0; r < rounds; r++) for (const m of members) if (m[r] !== undefined) out.push(m[r]);
  return out;
}

/** 홈 히어로 배경: 분야 영상들을 랜덤(분야 교차) 순서로 5초 남짓 간격 크로스페이드 순환.
 *  아래 CSS 전용 포스터 슬라이드쇼가 항상 깔려 있어, JS 하이드레이션 실패·자동재생 차단 등
 *  어떤 환경에서도 최소한 정지 화면에 갇히지는 않는다. */
export default function HeroRotator({ videos }: { videos: HeroVideoItem[] }) {
  const [order, setOrder] = useState<number[] | null>(null);
  const [pos, setPos] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // 순서 셔플은 클라이언트에서만 (SSR 마크업 불일치 방지)
    setOrder(interleavedOrder(videos));
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

  const cycle = videos.length * 5.5;
  return (
    <div className="absolute inset-0">
      {/* CSS 전용 포스터 슬라이드쇼 (JS 없이도 분야 교차로 순환) */}
      {videos.map((v, i) => (
        <img key={v.poster} src={v.poster} alt="" className="hero-fade absolute inset-0 w-full h-full object-cover"
          style={{ animationDuration: `${cycle}s`, animationDelay: `${i * 5.5 - cycle}s` }} />
      ))}
      {/* JS가 살아 있으면 영상 레이어가 위에서 재생·순환 */}
      {order && videos.map((v, i) => (
        <video key={v.src} ref={(el) => { refs.current[i] = el; }} src={v.src} autoPlay muted playsInline loop preload={i === order[0] ? 'auto' : 'metadata'} poster={v.poster}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`} />
      ))}
    </div>
  );
}
