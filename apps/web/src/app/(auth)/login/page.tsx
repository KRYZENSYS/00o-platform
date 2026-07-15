'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Tizimga kirildi!');
      setUser({ id: '1', email, username: email.split('@')[0] });
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-slate-950" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 font-bold shadow-lg shadow-pink-500/30">∞</div>
              <span className="text-xl font-bold">00o.uz</span>
            </Link>
            <h1 className="text-3xl font-bold md:text-4xl">Qaytib keldingiz! 👋</h1>
            <p className="mt-2 text-slate-400">Akkauntingizga kiring va davom eting</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/10">Telegram</button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/10">Google</button>
            </div>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">yoki email orqali</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none focus:border-violet-500" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm outline-none focus:border-violet-500" placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span className="text-slate-400">Eslab qolish</span></label>
                <Link href="/forgot-password" className="text-violet-400">Unutdingizmi?</Link>
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold shadow-lg shadow-pink-500/30 hover:scale-[1.02] disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Kirish <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
              Akkauntingiz yo'qmi? <Link href="/register" className="font-semibold text-violet-400">Ro'yxatdan o'tish</Link>
            </p>
          </div>
        </div>
        <div className="hidden bg-gradient-to-br from-violet-600/20 via-slate-950 to-pink-600/20 p-12 lg:flex lg:items-center lg:justify-center">
          <div className="max-w-md text-center">
            <Sparkles className="mx-auto h-16 w-16 text-violet-400" />
            <h2 className="mt-6 text-3xl font-bold">50,000+ foydalanuvchi</h2>
            <p className="mt-4 text-lg text-slate-400">O'zbekistondagi eng katta AI startup platformasi</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[{ v: '2.5K+', l: 'Startap' }, { v: '8K+', l: 'Frilanser' }, { v: '$12M+', l: 'Investitsiya' }, { v: '4.9★', l: 'Reyting' }].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{s.v}</p>
                  <p className="text-sm text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
