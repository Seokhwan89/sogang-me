'use client';
import { useState } from 'react';
export default function TranslateAll() {
  const [log, setLog] = useState<string[]>([]); const [busy, setBusy] = useState(false);
  async function run(target: 'posts' | 'faculty' | 'pages') {
    setBusy(true); setLog((l) => [...l, `${target}: 시작`]);
    let total = 0;
    for (let i = 0; i < 60; i++) {
      const r = await fetch('/api/translate-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, batch: 4 }) });
      const j = await r.json();
      if (!r.ok) { setLog((l) => [...l, `오류: ${j.error}`]); break; }
      total += j.done;
      setLog((l) => [...l.slice(0, -1), `${target}: ${total}건 완료, 남은 글 ${j.remaining}건${j.errors?.length ? ` (실패 ${j.errors.length})` : ''}`]);
      if (j.remaining === 0 || j.done === 0) break;
    }
    setBusy(false);
  }
  return (
    <div className="bg-white border border-sg-line p-5 text-[13px]">
      <p className="font-semibold">영문 누락 콘텐츠 일괄 번역</p>
      <p className="text-sg-steel mt-1">영문 제목·본문·요약이 비어 있는 글을 찾아 자동 번역합니다. 무료 번역기 기준 글 하나에 2~5초 걸리며, 창을 닫지 말고 기다려 주세요. (Anthropic 키가 설정되어 있으면 Claude 번역 사용)</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => run('posts')} className="btn-primary !py-2">{busy ? '번역 중…' : '게시글 번역'}</button>
        <button disabled={busy} onClick={() => run('faculty')} className="btn-ghost !py-2">교수진 번역</button>
        <button disabled={busy} onClick={() => run('pages')} className="btn-ghost !py-2">수정된 페이지 번역</button>
      </div>
      {log.length > 0 && <ul className="mt-3 space-y-1 text-[12.5px] font-mono">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
    </div>
  );
}
