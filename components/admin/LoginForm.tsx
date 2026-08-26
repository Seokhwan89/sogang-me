'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LoginForm() {
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr('');
    const fd = new FormData(e.currentTarget);
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('password')) });
    if (error) { setErr(error.message); setBusy(false); return; }
    window.location.reload();
  }
  return (
    <main className="min-h-screen grid place-items-center bg-sg-mist px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-sg-line p-8 space-y-4">
        <p className="eyebrow">Sogang ME · Admin</p>
        <h1 className="text-2xl font-bold">관리자 로그인</h1>
        <label className="block text-[13px]">이메일<input name="email" type="email" required autoComplete="username" className="input mt-1" /></label>
        <label className="block text-[13px]">비밀번호<input name="password" type="password" required autoComplete="current-password" className="input mt-1" /></label>
        {err && <p className="text-[13px] text-sg-red">{err}</p>}
        <button disabled={busy} className="btn-primary w-full justify-center">{busy ? '…' : '로그인'}</button>
        <p className="text-[12px] text-sg-steel">계정은 Supabase Authentication에서 생성하고, admins 테이블에 이메일을 등록해야 합니다.</p>
      </form>
    </main>
  );
}
