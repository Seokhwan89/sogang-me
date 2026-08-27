'use client';
import { useEffect } from 'react';
/** 게시글 상세에서 1회만 조회수를 올립니다. 같은 브라우저 세션에서 재방문·새로고침은 집계되지 않습니다. */
export default function ViewCounter({ id }: { id: number }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* 프라이빗 모드 등 */ }
    fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {});
  }, [id]);
  return null;
}
