'use client';
import { useRef, useState } from 'react';
import Uploader from './Uploader';

/** Lightweight HTML editor: toolbar inserts tags, image upload inserts <img>, live preview. */
export default function HtmlEditor({ name, defaultValue = '', folder = 'posts', rows = 18 }: { name: string; defaultValue?: string; folder?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const wrap = (before: string, after = '') => {
    const el = ref.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd; const sel = val.slice(s, e) || '텍스트';
    const next = val.slice(0, s) + before + sel + after + val.slice(e); setVal(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + before.length + sel.length + after.length; });
  };
  const insert = (html: string) => { const el = ref.current; const s = el ? el.selectionStart : val.length; setVal(val.slice(0, s) + html + val.slice(s)); };
  const B = ({ t, on }: { t: string; on: () => void }) => <button type="button" onClick={on} className="px-2 py-1 text-[12px] border border-sg-line bg-white hover:border-sg-ink font-mono">{t}</button>;
  return (
    <div className="border border-sg-line bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-sg-line bg-sg-mist items-center">
        <B t="H2" on={() => wrap('<h2>', '</h2>')} /><B t="H3" on={() => wrap('<h3>', '</h3>')} /><B t="B" on={() => wrap('<strong>', '</strong>')} />
        <B t="P" on={() => wrap('<p>', '</p>')} /><B t="UL" on={() => wrap('<ul>\n<li>', '</li>\n</ul>')} /><B t="LINK" on={() => wrap('<a href="https://" target="_blank">', '</a>')} />
        <B t="TABLE" on={() => insert('<table><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table>')} />
        <Uploader folder={folder} accept="image/*" multiple label="🖼 이미지 삽입" onDone={(fs) => insert(fs.map((f) => `<img src="${f.url}" alt="" />`).join('\n'))} />
        <span className="flex-1" />
        <button type="button" onClick={() => setPreview(!preview)} className="px-2 py-1 text-[12px] border border-sg-line bg-white">{preview ? '편집' : '미리보기'}</button>
      </div>
      {preview ? <div className="prose-sg p-4 min-h-[200px]" dangerouslySetInnerHTML={{ __html: val }} /> :
        <textarea ref={ref} name={name} value={val} onChange={(e) => setVal(e.target.value)} rows={rows} className="w-full p-3 font-mono text-[13px] outline-none" spellCheck={false} />}
      {preview && <textarea name={name} value={val} readOnly hidden />}
    </div>
  );
}
