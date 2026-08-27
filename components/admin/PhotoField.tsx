'use client';
import { useState } from 'react';
import Uploader from './Uploader';
export default function PhotoField({ defaultValue, name = 'photo_url', folder = 'faculty' }: { defaultValue?: string; name?: string; folder?: string }) {
  const [url, setUrl] = useState(defaultValue || '');
  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div className="aspect-[3/4] max-w-[180px] bg-sg-mist border border-sg-line overflow-hidden">{url && <img src={url} alt="" className="w-full h-full object-cover" />}</div>
      <div className="mt-2 flex gap-2"><Uploader folder={folder} accept="image/*" label="사진 업로드" onDone={(fs) => setUrl(fs[0].url)} />{url && <button type="button" onClick={() => setUrl('')} className="text-[12px] text-sg-red">제거</button>}</div>
    </div>
  );
}
