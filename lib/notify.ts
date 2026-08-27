import { createPublicClient } from './supabase-server';
/**
 * Email notification via Resend (https://resend.com, free tier 3,000/month).
 * Set RESEND_API_KEY in Vercel env. Recipient is configurable in 관리자 > 메인·설정 (notify_email).
 * If no key is configured this is a silent no-op so forms still work.
 */
export async function notifyAdmin(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  const sb = createPublicClient();
  const { data } = await sb.from('site_settings').select('value').eq('key', 'home').maybeSingle();
  const to = data?.value?.notify_email || process.env.NOTIFY_EMAIL;
  if (!to) return { skipped: true };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.NOTIFY_FROM || 'Sogang ME <onboarding@resend.dev>', to: [to], subject, html }),
    });
    return { ok: r.ok };
  } catch (e: any) { console.error('notify failed', e?.message); return { ok: false }; }
}
