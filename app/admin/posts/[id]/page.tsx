import { createClient } from '@/lib/supabase-server';
import PostForm, { DeletePostButton } from '@/components/admin/PostForm';
import { notFound } from 'next/navigation';

export default async function EditPost({ params, searchParams }: { params: { id: string }; searchParams: { board?: string } }) {
  const isNew = params.id === 'new';
  let post: any = null;
  if (!isNew) { const sb = createClient(); const { data } = await sb.from('posts').select('*').eq('id', Number(params.id)).single(); if (!data) notFound(); post = data; }
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{isNew ? '새 게시글' : `게시글 수정 #${post.id}`}</h1>{post && <DeletePostButton id={post.id} board={post.board} />}</div>
      <div className="mt-6"><PostForm post={post} defaultBoard={searchParams.board} /></div>
    </div>
  );
}
