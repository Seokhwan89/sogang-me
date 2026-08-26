/**
 * KO -> EN translation.
 *  - ANTHROPIC_API_KEY set           : Claude (best quality, HTML-aware, paid per use)
 *  - otherwise (default, free)       : Google Translate web endpoint, with MyMemory as fallback.
 *    Free endpoints translate text nodes only; HTML tags are preserved by splitting around them.
 * Returns null only when every provider fails.
 */
const FREE_LIMIT = 4500;

async function gtx(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`gtx ${r.status}`);
  const j = await r.json();
  return (j[0] || []).map((s: any) => s[0]).join('');
}
async function mymemory(text: string): Promise<string> {
  const email = process.env.TRANSLATE_CONTACT_EMAIL ? `&de=${encodeURIComponent(process.env.TRANSLATE_CONTACT_EMAIL)}` : '';
  const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|en${email}`);
  if (!r.ok) throw new Error(`mymemory ${r.status}`);
  const j = await r.json();
  if (!j.responseData?.translatedText || j.responseStatus !== 200) throw new Error('mymemory failed');
  return j.responseData.translatedText;
}
async function freeText(text: string): Promise<string> {
  if (!text.trim()) return text;
  const chunks: string[] = [];
  let buf = '';
  for (const line of text.split(/(?<=[.!?。]\s|\n)/)) { if ((buf + line).length > FREE_LIMIT) { chunks.push(buf); buf = ''; } buf += line; }
  if (buf) chunks.push(buf);
  const out: string[] = [];
  for (const c of chunks) { try { out.push(await gtx(c)); } catch { out.push(await mymemory(c)); } }
  return out.join('');
}
/** Translate only text between HTML tags, keep tags/attributes intact. */
async function freeHtml(html: string): Promise<string> {
  const parts = html.split(/(<[^>]+>)/g);
  const res: string[] = [];
  for (const p of parts) res.push(p.startsWith('<') || !p.trim() ? p : await freeText(p));
  return res.join('');
}

async function viaClaude(fields: Record<string, string>): Promise<Record<string, string> | null> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: 'claude-sonnet-4-5', max_tokens: 8000,
    system: 'You translate Korean university department website content into natural, professional English for an international academic audience. Preserve HTML tags, attributes, links and formatting exactly; translate only the human-readable text. Keep proper nouns (names, labs, course codes) accurate; romanize Korean names in standard form. Return ONLY a JSON object with the same keys as the input and translated string values, no markdown.',
    messages: [{ role: 'user', content: JSON.stringify(fields) }],
  });
  const text = res.content.map((c: any) => (c.type === 'text' ? c.text : '')).join('').replace(/```json|```/g, '').trim();
  try { return JSON.parse(text); } catch { return null; }
}

export async function translateKoToEn(fields: Record<string, string>): Promise<Record<string, string> | null> {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim());
  if (!entries.length) return {};
  if (process.env.ANTHROPIC_API_KEY) { const r = await viaClaude(Object.fromEntries(entries)); if (r) return r; }
  try {
    const out: Record<string, string> = {};
    for (const [k, v] of entries) out[k] = /<[a-z][^>]*>/i.test(v) ? await freeHtml(v) : await freeText(v);
    return out;
  } catch (e: any) { console.error('translate failed', e?.message); return null; }
}
export const translateProvider = () => (process.env.ANTHROPIC_API_KEY ? 'claude' : 'free');
