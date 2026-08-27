'use client';
import { useState } from 'react';

export default function TranslateAll({ provider = 'free' }: { provider?: string }) {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function run(target: 'posts' | 'faculty' | 'pages', force = false) {
    if (force && !confirm(`${target === 'posts' ? '게시글' : '교수진'} 영문을 모두 다시 번역합니다.\n관리자가 직접 손본 영문도 덮어씁니다. 계속할까요?`)) return;
    setBusy(true); setLog((l) => [...l, `${target}${force ? ' (재번역)' : ''}: 시작`]);
    let total = 0;
    for (let i = 0; i < 400; i++) {
      try {
        const r = await fetch('/api/translate-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, batch: 3, force }) });
        const j = await r.json();
        if (!r.ok) { setLog((l) => [...l, `오류: ${j.error}`]); break; }
        total += j.done;
        setLog((l) => [...l.slice(0, -1), `${target}${force ? ' (재번역)' : ''}: ${total}건 완료 · 남은 ${j.remaining}건${j.errors?.length ? ` · 실패 ${j.errors.length}` : ''}`]);
        if (j.remaining === 0 || j.done === 0) break;
      } catch (e: any) { setLog((l) => [...l, '중단: ' + e.message]); break; }
    }
    setBusy(false);
  }

  const claude = provider === 'claude';
  return (
    <div className="bg-white border border-sg-line p-5 text-[13px]">
      <div className="flex items-center gap-2">
        <p className="font-semibold">영문 번역</p>
        <span className={`px-2 py-0.5 text-[11px] ${claude ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {claude ? 'Claude 번역 사용 중 (고품질)' : '무료 번역기 사용 중 (품질 낮음)'}
        </span>
      </div>
      {!claude && <p className="mt-2 text-sg-steel">Vercel 환경변수에 <code>ANTHROPIC_API_KEY</code>를 추가하면 전문 용어와 문맥이 정확한 Claude 번역으로 자동 전환됩니다.</p>}
      <p className="text-sg-steel mt-1">영문이 비어 있는 항목만 번역합니다. 글 하나에 3~6초 걸리며, 창을 닫지 말고 기다려 주세요.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => run('posts')} className="btn-primary !py-2">{busy ? '진행 중…' : '게시글 번역'}</button>
        <button disabled={busy} onClick={() => run('faculty')} className="btn-ghost !py-2">교수진 번역</button>
        <button disabled={busy} onClick={() => run('pages')} className="btn-ghost !py-2">수정된 페이지 번역</button>
      </div>
      <div className="mt-4 pt-3 border-t border-sg-line">
        <p className="font-semibold">전체 재번역 <span className="font-normal text-sg-steel">— 무료 번역본을 Claude 번역으로 교체할 때 사용</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button disabled={busy || !claude} onClick={() => run('posts', true)} className="btn-ghost !py-2 disabled:opacity-40">게시글 전체 재번역</button>
          <button disabled={busy || !claude} onClick={() => run('faculty', true)} className="btn-ghost !py-2 disabled:opacity-40">교수진 전체 재번역</button>
        </div>
        {!claude && <p className="mt-2 text-[12px] text-sg-steel">API 키를 설정해야 사용할 수 있습니다.</p>}
      </div>
      {log.length > 0 && <ul className="mt-3 space-y-1 text-[12.5px] font-mono">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
    </div>
  );
}
