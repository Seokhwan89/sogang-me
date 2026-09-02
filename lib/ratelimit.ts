/** 공개 폼(예약·URECA·조회수)용 최소한의 요청 제한.
 *  서버리스 인스턴스별 메모리라 완전하지는 않지만, 단일 IP의 반복 폭주(DB·알림메일 폭탄)를 막는다. */
const buckets = new Map<string, number[]>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

/** windowMs 안에 같은 key로 limit회를 넘으면 false. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { buckets.set(key, arr); return false; }
  arr.push(now); buckets.set(key, arr);
  if (buckets.size > 5000) { // 오래된 키 청소
    for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  }
  return true;
}
