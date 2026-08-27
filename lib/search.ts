/** PostgREST `.or()` 필터에 안전하게 넣기 위해 검색어를 정제합니다. (%, _, 쉼표, 괄호, 따옴표 등이 쿼리를 깨뜨림) */
export function safeQuery(q: string | undefined | null): string {
  return (q || '').trim().replace(/[%_,()"'\\*]/g, ' ').replace(/\s+/g, ' ').slice(0, 60).trim();
}
