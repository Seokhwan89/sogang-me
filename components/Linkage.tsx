'use client';
import { useEffect, useRef } from 'react';

/**
 * Signature hero graphic: an animated four-bar linkage drawn as engineering line art.
 * Pure SVG + requestAnimationFrame; respects prefers-reduced-motion.
 */
export default function Linkage() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current; if (!svg) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const A = { x: 120, y: 300 }, D = { x: 400, y: 300 };
    const r1 = 70, r2 = 190, r3 = 150; // crank, coupler, rocker
    const crank = svg.querySelector('#crank') as SVGLineElement;
    const coupler = svg.querySelector('#coupler') as SVGLineElement;
    const rocker = svg.querySelector('#rocker') as SVGLineElement;
    const jB = svg.querySelector('#jB') as SVGCircleElement;
    const jC = svg.querySelector('#jC') as SVGCircleElement;
    const tip = svg.querySelector('#tip') as SVGCircleElement;
    const trace = svg.querySelector('#trace') as SVGPathElement;
    const tri = svg.querySelector('#tri') as SVGPolygonElement;
    let t = 0, raf = 0; const pts: string[] = [];
    const step = () => {
      t += reduce ? 0 : 0.016;
      const B = { x: A.x + r1 * Math.cos(t), y: A.y + r1 * Math.sin(t) };
      const dx = D.x - B.x, dy = D.y - B.y, d = Math.hypot(dx, dy);
      const a = (r2 * r2 - r3 * r3 + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(r2 * r2 - a * a, 0));
      const mx = B.x + (a * dx) / d, my = B.y + (a * dy) / d;
      const C = { x: mx - (h * dy) / d, y: my + (h * dx) / d };
      // coupler point (offset triangle)
      const ux = (C.x - B.x) / r2, uy = (C.y - B.y) / r2;
      const P = { x: B.x + ux * 95 - uy * -80, y: B.y + uy * 95 + ux * -80 };
      crank.setAttribute('x2', `${B.x}`); crank.setAttribute('y2', `${B.y}`);
      coupler.setAttribute('x1', `${B.x}`); coupler.setAttribute('y1', `${B.y}`);
      coupler.setAttribute('x2', `${C.x}`); coupler.setAttribute('y2', `${C.y}`);
      rocker.setAttribute('x1', `${C.x}`); rocker.setAttribute('y1', `${C.y}`);
      jB.setAttribute('cx', `${B.x}`); jB.setAttribute('cy', `${B.y}`);
      jC.setAttribute('cx', `${C.x}`); jC.setAttribute('cy', `${C.y}`);
      tip.setAttribute('cx', `${P.x}`); tip.setAttribute('cy', `${P.y}`);
      tri.setAttribute('points', `${B.x},${B.y} ${C.x},${C.y} ${P.x},${P.y}`);
      pts.push(`${P.x.toFixed(1)},${P.y.toFixed(1)}`); if (pts.length > 400) pts.shift();
      trace.setAttribute('d', 'M' + pts.join(' L'));
      if (!reduce) raf = requestAnimationFrame(step);
    };
    step(); return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg ref={ref} viewBox="40 60 480 340" className="w-full h-full" aria-hidden>
      <defs>
        <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#fff" strokeOpacity=".07" /></pattern>
      </defs>
      <rect x="40" y="60" width="480" height="340" fill="url(#g)" />
      <path id="trace" d="" fill="none" stroke="var(--sg-red)" strokeWidth="1.5" strokeOpacity=".9" />
      <polygon id="tri" fill="var(--sg-red)" fillOpacity=".12" stroke="none" />
      <line x1="120" y1="300" x2="400" y2="300" stroke="#fff" strokeOpacity=".25" strokeDasharray="4 6" />
      <line id="crank" x1="120" y1="300" x2="190" y2="300" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line id="coupler" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line id="rocker" x2="400" y2="300" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <g fill="#16181d" stroke="#fff" strokeWidth="2">
        <circle cx="120" cy="300" r="7" /><circle cx="400" cy="300" r="7" />
        <circle id="jB" r="5" /><circle id="jC" r="5" />
      </g>
      <circle id="tip" r="6" fill="var(--sg-red)" />
      <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#fff" fillOpacity=".55">
        <text x="104" y="330">A</text><text x="404" y="330">D</text>
        <text x="60" y="90">FOUR-BAR LINKAGE · r₁=70 r₂=190 r₃=150</text>
      </g>
    </svg>
  );
}
