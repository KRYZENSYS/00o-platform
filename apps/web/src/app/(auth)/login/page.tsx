'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.login(email, password);
      const me = await api.users.me();
      setUser(me.data);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || 'Email yoki parol noto\'g\'ri');
    } finally { setLoading(false); }
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
          <h1 className="text-2xl font-bold">Tizimga kirish</h1>
          <p className="mt-1 text-sm text-slate-500">Akkauntingizga kiring va davom eting</p>
        </div>

        <div className="card animate-slide-up p-6 shadow-xl">
          <form onSubmit={handle} className="space-y-3">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="px-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

            <Button type="submit" variant="gradient" loading={loading} fullWidth>
              Kirish <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400">yoki</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <Link href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'ooouzbot'}?start=login`} target="_blank">
            <Button type="button" variant="outline" fullWidth>
              <span className="text-base">📱</span> Telegram orqali kirish
            </Button>
          </Link>

          <p className="mt-4 text-center text-sm">
            Akkaunt yo'qmi? <Link href="/auth/register" className="font-semibold text-violet-500 hover:underline">Ro'yxatdan o'tish</Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Xavfsiz</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> JWT</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> bcrypt</span>
        </div>
      </div>
    </div>
  );
}
