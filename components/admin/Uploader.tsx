'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

const MAX_MB = 10;              // 업로드 허용 최대 용량
const MAX_EDGE = 1920;          // 이미지 최대 가로/세로 (px)
const JPEG_QUALITY = 0.82;

/** 큰 사진은 업로드 전에 브라우저에서 축소해 저장소 용량과 페이지 로딩을 아낍니다. */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size <= 1_200_000) return file;
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(png|webp|bmp|tiff?)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch { return file; }
}

export async function uploadToMedia(file: File, folder = 'uploads') {
  const sb = createClient();
  const f = await shrinkImage(file);
  if (f.size > MAX_MB * 1024 * 1024) throw new Error(`${MAX_MB}MB 이하 파일만 올릴 수 있습니다 (현재 ${(f.size / 1024 / 1024).toFixed(1)}MB)`);
  const ext = (f.name.split('.').pop() || 'bin').toLowerCase();
  const safe = f.name.replace(/[^\w.\-가-힣]/g, '_');
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, f, { upsert: false, contentType: f.type });
  if (error) throw error;
  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl, name: safe, size: f.size };
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
