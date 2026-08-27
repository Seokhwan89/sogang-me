'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

/** Uploads a file to Supabase Storage bucket "media" and returns its public URL. */
export async function uploadToMedia(file: File, folder = 'uploads') {
  const sb = createClient();
  const ext = file.name.split('.').pop();
  const safe = file.name.replace(/[^\w.\-가-힣]/g, '_');
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl, name: safe, size: file.size };
}

export default function Uploader({ folder, accept, multiple, onDone, label = '파일 선택' }: { folder: string; accept?: string; multiple?: boolean; onDone: (files: { url: string; name: string; size: number }[]) => void; label?: string }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState(0);
  return (
    <label className="inline-flex items-center gap-2 px-3 py-2 border border-sg-line bg-white text-[13px] cursor-pointer hover:border-sg-ink">
      <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={async (e) => {
        const files = Array.from(e.target.files || []); if (!files.length) return;
        setBusy(true); setErr('');
        try { const out = []; for (const f of files) out.push(await uploadToMedia(f, folder)); onDone(out); setDone(out.length); setTimeout(() => setDone(0), 4000); }
        catch (x: any) { setErr(x.message || 'upload failed'); }
        setBusy(false); e.target.value = '';
      }} />
      {busy ? '업로드 중…' : done ? `✓ ${done}개 업로드 완료` : label}{err && <span className="text-sg-red">{err}</span>}
    </label>
  );
}
