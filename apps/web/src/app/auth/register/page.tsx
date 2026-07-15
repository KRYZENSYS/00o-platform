'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AtSign, Sparkles, ArrowRight, Gift, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' });
  const [referral, setReferral] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.auth.register({
        email: form.email,
        username: form.username,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
        referral_code: referral || undefined,
      });
      await api.auth.login(form.email, form.password);
      const me = await api.users.me();
      setUser(me.data);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const passStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

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
          <h1 className="text-2xl font-bold">Ro'yxatdan o'tish</h1>
          <p className="mt-1 text-sm text-slate-500">100 🪙 bonus bilan boshlang!</p>
        </div>

        <div className="card animate-slide-up p-6 shadow-xl">
          <form onSubmit={handle} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Ism</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required maxLength={50} /></div>
              <div><Label>Familiya</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} maxLength={50} /></div>
            </div>
            <div>
              <Label>Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} required minLength={3} maxLength={30} className="pl-10" placeholder="username" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} className="pl-10" />
              </div>
              {form.password && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn('h-1 flex-1 rounded', i <= passStrength ? (passStrength <= 1 ? 'bg-red-500' : passStrength <= 2 ? 'bg-orange-500' : passStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-200 dark:bg-slate-800')} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label className="flex items-center gap-1"><Gift className="h-3 w-3" /> Referral kod (ixtiyoriy)</Label>
              <Input value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())} placeholder="XXXXX" maxLength={20} />
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs">
              <p className="font-semibold text-violet-500">🎁 Bonuslar:</p>
              <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 100 🪙 signup bonus</li>
                <li className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> AI chat 5 so'rov/kun</li>
                <li className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Bepul startap yaratish</li>
              </ul>
            </div>

            <Button type="submit" variant="gradient" loading={loading} fullWidth>
              Ro'yxatdan o'tish <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 text-center text-sm">
            Akkaunt bormi? <Link href="/auth/login" className="font-semibold text-violet-500 hover:underline">Kirish</Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" /> Ma'lumotlaringiz xavfsiz
        </p>
      </div>
    </div>
  );
}
