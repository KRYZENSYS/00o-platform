'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Sparkles, ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login(email, password);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegram = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const initData = tg.initData;
      if (initData) {
        api.auth.loginWithTelegram(initData).then(res => {
          setUser(res.data.user);
          router.push('/dashboard');
        }).catch(e => setError(e.response?.data?.message || 'Telegram login xatolik'));
      } else {
        setError('Telegram WebApp mavjud emas');
      }
    } else {
      window.location.href = `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'ooouzbot'}?start=login`;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold gradient-text">00o.uz</span>
          </Link>
          <h1 className="text-2xl font-bold">Xush kelibsiz!</h1>
          <p className="mt-1 text-sm text-slate-500">Davom etish uchun kiring</p>
        </div>

        <div className="card animate-fade-in p-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className="pl-10" />
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

            <Button type="submit" variant="gradient" loading={loading} fullWidth>
              Kirish <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-500">yoki</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <Button onClick={handleTelegram} variant="outline" fullWidth>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.6 8.16l-1.85 8.73c-.14.62-.5.77-1.01.48l-2.8-2.06-1.35 1.3c-.15.15-.27.27-.55.27l.2-2.79 5.1-4.6c.22-.2-.05-.31-.34-.12L8.46 12.7l-2.71-.85c-.59-.18-.6-.59.12-.87l10.59-4.08c.49-.18.92.11.76.26z" /></svg>
            Telegram orqali kirish
          </Button>

          <p className="mt-4 text-center text-sm">
            Akkaunt yo'qmi? <Link href="/auth/register" className="font-semibold text-violet-500 hover:underline">Ro'yxatdan o'tish</Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" /> Xavfsiz ulanish · JWT
        </p>
      </div>
    </div>
  );
}
