'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const r = await api.auth.login({ email, password });
      const { access_token, refresh_token } = r.data || {};
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
        const me = await api.users.me();
        setUser(me.data);
        router.replace('/dashboard');
      } else { setErr('Token olinmadi'); }
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Login yoki parol noto\'g\'ri');
    } finally { setLoading(false); }
  };

  const telegramLogin = async () => {
    setTelegramLoading(true);
    try {
      const w = window.open('https://t.me/ooouzbot?start=login', '_blank');
      if (w) {
        const checkClosed = setInterval(() => {
          if (w.closed) {
            clearInterval(checkClosed);
            setTelegramLoading(false);
            window.location.reload();
          }
        }, 1000);
      }
    } catch { setTelegramLoading(false); }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Kirish</CardTitle>
        <p className="text-sm text-slate-500">00o.uz hisobingizga kiring</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={telegramLogin} variant="gradient" fullWidth disabled={telegramLoading}>
          {telegramLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Telegram orqali kirish
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500 dark:bg-slate-950">yoki</span></div>
        </div>

        <form onSubmit={submit} className="space-y-3">
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
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-10" />
            </div>
          </div>

          {err && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500">{err}</div>}

          <Button type="submit" fullWidth loading={loading}>
            <Sparkles className="h-4 w-4" /> Kirish
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Hisobingiz yo\'qmi? <Link href="/register" className="font-semibold text-violet-500 hover:underline">Ro\'yxatdan o\'tish</Link>
        </p>
      </CardContent>
    </Card>
  );
}
