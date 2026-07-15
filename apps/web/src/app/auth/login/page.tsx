'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { getErrorMessage } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithTelegram, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
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
        setError('Telegram WebApp mavjud emas. Telegram orqali oching.');
        return;
      }
      tg.ready();
      const initData = tg.initData;
      if (!initData) {
        setError('Telegram initData olinmadi');
        return;
      }
      await loginWithTelegram(initData);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-orange-500/5 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-lg font-bold text-white">∞</div>
          <span className="text-xl font-bold">00o.uz</span>
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <h1 className="mb-1 text-2xl font-bold">Xush kelibsiz!</h1>
          <p className="mb-6 text-sm text-slate-500">Akkauntingizga kiring</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email yoki username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-slate-600 dark:text-slate-400">Eslab qolish</span>
              </label>
              <Link href="/auth/forgot" className="text-violet-500 hover:underline">Parolni unutdingizmi?</Link>
            </div>

            <Button type="submit" variant="gradient" fullWidth loading={isLoading}>
              Kirish <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-500">yoki</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <Button type="button" variant="outline" fullWidth onClick={handleTelegram}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.16-.04-.23-.02-.1.02-1.65 1.05-4.65 3.08-.44.3-.84.45-1.2.44-.4-.01-1.16-.22-1.72-.41-.69-.23-1.24-.34-1.19-.71.02-.2.27-.4.74-.61 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            Telegram orqali kirish
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Akkauntingiz yo'qmi? <Link href="/auth/register" className="font-semibold text-violet-500 hover:underline">Ro'yxatdan o'tish</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo: <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-900">demo@00o.uz</code> / <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-900">demo1234</code>
        </p>
      </div>
    </div>
  );
}
