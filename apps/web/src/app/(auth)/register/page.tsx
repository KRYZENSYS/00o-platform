'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, Loader2, Check, X, Eye, EyeOff, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ firstName: '', email: '', username: '', password: '', referral: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const passwordChecks = [
    { label: 'Kamida 8 belgi', valid: form.password.length >= 8 },
    { label: 'Katta harf', valid: /[A-Z]/.test(form.password) },
    { label: 'Raqam', valid: /\d/.test(form.password) },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChecks.every((c) => c.valid)) { toast.error('Parol talablarga javob bermaydi'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('verify'); toast.success('Emailingizga kod yuborildi'); }, 1000);
  };

  const verify = () => {
    if (code.join('').length !== 6) { toast.error('6 raqamli kodni kiriting'); return; }
    setLoading(true);
    setTimeout(() => {
      setUser({ id: '1', email: form.email, username: form.username });
      toast.success('Akkaunt yaratildi! 100 🪙 bonus');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/40 via-slate-950 to-slate-950" />
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 font-bold shadow-lg shadow-pink-500/30">∞</div>
            <span className="text-xl font-bold">00o.uz</span>
          </Link>
          {step === 'form' ? (
            <>
              <h1 className="text-3xl font-bold md:text-4xl">Ro'yxatdan o'ting 🚀</h1>
              <p className="mt-2 text-slate-400">Bepul akkaunt yarating</p>
              <div className="mt-6 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-pink-500/10 p-3 text-sm">
                <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-violet-400" /><span><strong>100 🪙</strong> bonus + <strong>7 kun Pro</strong> bepul!</span></div>
              </div>
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Ism</label>
                    <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-violet-500" placeholder="Aziz" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Username</label>
                    <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-violet-500" placeholder="aziz_k" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-violet-500" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Parol</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 pr-10 text-sm outline-none focus:border-violet-500" placeholder="••••••••" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      {passwordChecks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2 text-xs">
                          {c.valid ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-slate-500" />}
                          <span className={c.valid ? 'text-green-400' : 'text-slate-500'}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Referral kod (ixtiyoriy)</label>
                  <input value={form.referral} onChange={(e) => setForm({ ...form, referral: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-violet-500" placeholder="Do'stingizdan olgan kod" />
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-400">
                  <input type="checkbox" required className="mt-0.5 rounded" />
                  <span><Link href="/terms" className="text-violet-400">Foydalanish shartlari</Link>ga roziman</span>
                </label>
                <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold shadow-lg shadow-pink-500/30 hover:scale-[1.02] disabled:opacity-50">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Ro'yxatdan o'tish <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500"><Mail className="h-8 w-8" /></div>
                <h1 className="mt-6 text-3xl font-bold">Emailni tasdiqlang</h1>
                <p className="mt-2 text-slate-400">{form.email} ga 6 raqamli kod yubordik</p>
              </div>
              <div className="mt-8 flex justify-center gap-2">
                {code.map((c, i) => (
                  <input key={i} type="text" maxLength={1} value={c} onChange={(e) => { const v = e.target.value; setCode((p) => { const n = [...p]; n[i] = v; return n; }); if (v && i < 5) (document.getElementById(`code-${i + 1}`) as HTMLInputElement)?.focus(); }} id={`code-${i}`} className="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center text-2xl font-bold outline-none focus:border-violet-500" />
                ))}
              </div>
              <button onClick={verify} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 py-3 font-semibold disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tasdiqlash'}
              </button>
              <button onClick={() => toast.info('Kod qayta yuborildi')} className="mt-3 w-full text-sm text-violet-400">Kodni qayta yuborish</button>
            </>
          )}
          <p className="mt-6 text-center text-sm text-slate-400">
            Akkaunt bormi? <Link href="/login" className="font-semibold text-violet-400">Kirish</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
