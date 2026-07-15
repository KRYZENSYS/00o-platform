'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { getErrorMessage } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithTelegram, isLoading } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', email: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError('Parollar mos kelmadi');
      return;
    }
    if (form.password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      await register({ ...form, referralCode: ref || undefined });
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleTelegram = async () => {
    try {
      // @ts-ignore
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        setError('Telegram WebApp mavjud emas');
        return;
      }
      tg.ready();
      await loginWithTelegram(tg.initData);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-orange-500/5 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-lg font-bold text-white">∞</div>
          <span className="text-xl font-bold">00o.uz</span>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <h1 className="mb-1 text-2xl font-bold">Ro'yxatdan o'tish</h1>
          <p className="mb-6 text-sm text-slate-500">100 🪙 bonus bilan boshlang</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>
          )}

          <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold text-violet-500">
              <Gift className="h-4 w-4" /> 100 token bonus
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">AI yordamchi, marketplace va boshqa xizmatlardan foydalaning</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <Label>Ism</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input required value={form.firstName} onChange={update('firstName')} placeholder="Ismingiz" className="pl-10" />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className="pl-10" />
              </div>
            </div>

            <div>
              <Label>Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                <Input required value={form.username} onChange={update('username')} placeholder="username" className="pl-10" pattern="[a-zA-Z0-9_]+" />
              </div>
            </div>

            <div>
              <Label>Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" required value={form.password} onChange={update('password')} placeholder="Kamida 8 belgi" className="pl-10" minLength={8} />
              </div>
            </div>

            <div>
              <Label>Parolni tasdiqlang</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" required value={form.confirm} onChange={update('confirm')} placeholder="Parolni qayta kiriting" className="pl-10" />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input type="checkbox" required className="mt-0.5" />
              <span><Link href="/terms" className="text-violet-500">Foydalanish shartlari</Link> va <Link href="/privacy" className="text-violet-500">Maxfiylik siyosati</Link>ga roziman</span>
            </label>

            <Button type="submit" variant="gradient" fullWidth loading={isLoading}>
              Ro'yxatdan o'tish <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-500">yoki</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <Button type="button" variant="outline" fullWidth onClick={handleTelegram}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.16-.04-.23-.02-.1.02-1.65 1.05-4.65 3.08-.44.3-.84.45-1.2.44-.4-.01-1.16-.22-1.72-.41-.69-.23-1.24-.34-1.19-.71.02-.2.27-.4.74-.61 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            Telegram orqali
          </Button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Akkauntingiz bormi? <Link href="/auth/login" className="font-semibold text-violet-500 hover:underline">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
