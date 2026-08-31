/** 페이지 히어로 공용 장식 레이어 — 블루프린트 그리드 + 회전 기어·치수선·흐름선.
 *  FieldEmblems와 같은 방식: 순수 SVG + SMIL 애니메이션 (JS 없음, prefers-reduced-motion 시 정지). */

function Gear({ r, teeth, cx, cy, dur, reverse = false }: { r: number; teeth: number; cx: number; cy: number; dur: string; reverse?: boolean }) {
  const marks = Array.from({ length: teeth }, (_, i) => {
    const a = (i * 2 * Math.PI) / teeth;
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a) * (r + 10), y2 = cy + Math.sin(a) * (r + 10);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
  });
  return (
    <g strokeWidth="2.5">
      <animateTransform attributeName="transform" type="rotate" from={`${reverse ? 360 : 0} ${cx} ${cy}`} to={`${reverse ? 0 : 360} ${cx} ${cy}`} dur={dur} repeatCount="indefinite" />
      <circle cx={cx} cy={cy} r={r} fill="none" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" strokeDasharray="6 8" />
      <circle cx={cx} cy={cy} r={4} fill="currentColor" stroke="none" />
      {marks}
    </g>
  );
}

export default function HeroDecor() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none text-white overflow-hidden">
      {/* 블루프린트 그리드 */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.1]">
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <pattern id="hero-grid-lg" width="240" height="240" patternUnits="userSpaceOnUse">
            <path d="M240 0H0V240" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
        <rect width="100%" height="100%" fill="url(#hero-grid-lg)" />
      </svg>
      {/* 우측 기계 요소: 맞물린 기어 + 치수 호 + 흐름선 */}
      <svg viewBox="0 0 900 420" preserveAspectRatio="xMaxYMid slice" className="absolute right-0 top-1/2 -translate-y-1/2 h-[130%] w-auto max-w-none opacity-[0.16] stroke-current fill-none">
        <Gear cx={700} cy={140} r={95} teeth={16} dur="46s" />
        <Gear cx={840} cy={280} r={62} teeth={12} dur="30s" reverse />
        {/* 치수 호 (dash가 흐르는 원호) */}
        <circle cx={700} cy={140} r={150} strokeWidth="1.5" strokeDasharray="4 10">
          <animate attributeName="stroke-dashoffset" from="0" to="-140" dur="9s" repeatCount="indefinite" />
        </circle>
        {/* 수평 흐름선 + 이동 입자 */}
        <g strokeWidth="1.5">
          <line x1="80" y1="330" x2="560" y2="330" strokeDasharray="2 10" />
          <line x1="40" y1="360" x2="500" y2="360" strokeDasharray="2 14" opacity="0.7" />
          <circle r="4" fill="currentColor" stroke="none">
            <animateMotion path="M80,330 L560,330" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle r="3" fill="currentColor" stroke="none" opacity="0.7">
            <animateMotion path="M40,360 L500,360" dur="11s" repeatCount="indefinite" />
          </circle>
        </g>
        {/* 십자 기준점 */}
        <g strokeWidth="1.5" opacity="0.8">
          <path d="M150 90h24M162 78v24" /><path d="M320 210h20M330 200v20" /><path d="M520 70h20M530 60v20" />
        </g>
      </svg>
    </div>
  );
}
