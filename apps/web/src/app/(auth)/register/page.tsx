'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, Mail, Lock, User, Loader2, Sparkles, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const r = await api.auth.register(form);
      const { access_token, refresh_token } = r.data || {};
      if (access_token) {
        localStorage.setItem('access_token', access_token);
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
        const me = await api.users.me();
        setUser(me.data);
        router.replace('/dashboard');
      } else { setErr('Token olinmadi'); }
    } catch (e: any) {
      setErr(e?.response?.data?.detail || 'Ro\'yxatdan o\'tishda xatolik');
    } finally { setLoading(false); }
  };

  const telegramRegister = () => {
    setTgLoading(true);
    try {
      const w = window.open('https://t.me/ooouzbot?start=register', '_blank');
      if (w) {
        const t = setInterval(() => {
          if (w.closed) { clearInterval(t); setTgLoading(false); window.location.reload(); }
        }, 1000);
      }
    } catch { setTgLoading(false); }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Ro\'yxatdan o\'tish</CardTitle>
        <p className="text-sm text-slate-500">100 🪙 bonus bilan boshlang</p>
        <div className="mx-auto mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
          <Gift className="h-3 w-3" /> 100 tokens bepul
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={telegramRegister} variant="gradient" fullWidth disabled={tgLoading}>
          {tgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Telegram orqali ro\'yxatdan o\'tish
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500 dark:bg-slate-950">yoki email bilan</span></div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Ism</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></div>
            <div><Label>Familiya</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
          </div>
          <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="kryzensys" /></div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div>
            <Label>Parol</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Kamida 8 ta belgi" required minLength={8} />
          </div>

          {err && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-500">{err}</div>}

          <p className="text-[10px] text-slate-500">Ro\'yxatdan o\'tish orqali <Link href="#" className="underline">foydalanish shartlari</Link>ga rozilik bildirasiz</p>

          <Button type="submit" fullWidth loading={loading}>
            <Sparkles className="h-4 w-4" /> Ro\'yxatdan o\'tish
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Hisobingiz bormi? <Link href="/login" className="font-semibold text-violet-500 hover:underline">Kirish</Link>
        </p>
      </CardContent>
    </Card>
  );
}
