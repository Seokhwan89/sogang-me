'use client';
import { useState } from 'react';
export default function SlideDeck({ slides, download, label }: { slides: string[]; download?: string; label?: string }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((i + d + slides.length) % slides.length);
  return (
    <div className="bg-sg-ink text-white p-3 md:p-4">
      <div className="relative aspect-[16/9] bg-black overflow-hidden">
        <img src={slides[i]} alt={`slide ${i + 1}`} className="absolute inset-0 w-full h-full object-contain" />
        <button onClick={() => go(-1)} aria-label="previous" className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center bg-black/50 hover:bg-sg-cardinal text-white text-xl">‹</button>
        <button onClick={() => go(1)} aria-label="next" className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center bg-black/50 hover:bg-sg-cardinal text-white text-xl">›</button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-[13px]">
        <span className="text-white/70">{label} · {i + 1} / {slides.length}</span>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">{slides.map((s, k) => <button key={k} onClick={() => setI(k)} className={`w-12 h-8 shrink-0 border ${k === i ? 'border-sg-cardinal' : 'border-white/20 opacity-60 hover:opacity-100'}`}><img src={s} alt="" className="w-full h-full object-cover" /></button>)}</div>
        {download && <a href={download} download className="shrink-0 btn-primary !py-2 !px-4 !text-[13px]">PDF ↓</a>}
      </div>
    </div>
  );
}
