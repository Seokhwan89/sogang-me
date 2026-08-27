/** Convert admin input to safe-ish display HTML. Plain text (no block tags) gets paragraphs/line breaks. */
export function toHtml(input: string | null | undefined): string {
  const s = (input || '').trim();
  if (!s) return '';
  if (/<(p|div|br|ul|ol|h[1-6]|table|blockquote|img|iframe|figure)\b/i.test(s)) return s;
  return s.split(/\n{2,}/).map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('\n');
}
/** Extract YouTube video id from any common URL form. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
export const youtubeThumb = (url: string | null | undefined) => { const id = youtubeId(url); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null; };
export function youtubeStart(url: string | null | undefined): number { const m = (url || '').match(/[?&]t=(\d+)/); return m ? Number(m[1]) : 0; }
