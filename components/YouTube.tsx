import { youtubeId, youtubeStart } from '@/lib/html';
export default function YouTube({ url, title = 'YouTube video', className = '' }: { url: string; title?: string; className?: string }) {
  const id = youtubeId(url); if (!id) return null;
  const start = youtubeStart(url);
  return (
    <div className={`relative w-full aspect-video bg-black border border-sg-line ${className}`}>
      <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ''}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  );
}
