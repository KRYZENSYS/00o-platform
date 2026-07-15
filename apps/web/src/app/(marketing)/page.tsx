'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Rocket, Briefcase, Users, DollarSign, Globe, Crown, Check, TrendingUp, MessageCircle, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
        <div className="absolute -right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -left-20 bottom-20 h-72 w-72 animate-pulse rounded-full bg-pink-500/30 blur-3xl" />

        <div className="container relative mx-auto flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-white/50 px-4 py-1.5 text-xs font-medium backdrop-blur dark:bg-slate-900/50 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span>🇺🇿 O'zbekistondagi #1 AI Startup Hub</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl lg:text-7xl">
            <span className="block">Kelajakni</span>
            <span className="block gradient-text animate-gradient bg-[length:200%_200%]">bugun quring</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
            AI yordamchi, startup ekotizimi, professional xizmatlar va investorlar — barchasi <strong>bitta platformada</strong>.
            20+ AI vosita, 5 ta til modeli, real-time chat va undan ko'p.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register"><Button size="lg" variant="gradient">Bepul boshlash <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/ai"><Button size="lg" variant="outline"><Sparkles className="h-4 w-4" /> AI ni sinab ko'ring</Button></Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 100 🪙 bonus</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Karta kerak emas</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Telegram orqali</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> O'zbek tilida</span>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{ v: '20+', l: 'AI vosita' }, { v: '5', l: 'AI model' }, { v: '3', l: 'Til' }, { v: '∞', l: 'G\'oyalar' }].map((s) => (
              <div key={s.l} className="card text-center">
                <div className="text-2xl font-black gradient-text md:text-3xl">{s.v}</div>
                <div className="text-xs text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-4xl">Hammasi <span className="gradient-text">bir joyda</span></h2>
            <p className="mt-2 text-slate-500">Startap yaratish uchun kerak bo'lgan barcha vositalar</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Sparkles, t: 'AI Yordamchi', d: '20+ AI vosita: g\'oya, biznes-plan, kod, tarjima, blog', c: 'from-violet-500 to-pink-500' },
              { i: Rocket, t: 'Startup Hub', d: 'Startapingizni yarating, jamoa toping, investor jalb qiling', c: 'from-pink-500 to-orange-500' },
              { i: Briefcase, t: 'Marketplace', d: 'Professional xizmatlar — dizayn, kod, marketing, kontent', c: 'from-blue-500 to-cyan-500' },
              { i: Users, t: 'Jamoa topish', d: 'Ish bering yoki toping — vakansiya va portfolio tizimi', c: 'from-green-500 to-emerald-500' },
              { i: DollarSign, t: 'Investorlar', d: 'Pitch deck yarating, funding oling', c: 'from-amber-500 to-orange-500' },
              { i: MessageCircle, t: 'Real-time Chat', d: 'Jamoa, mijozlar, investorlar bilan tezkor aloqa', c: 'from-rose-500 to-pink-500' },
            ].map((f) => (
              <div key={f.t} className="card group transition hover:shadow-xl">
                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${f.c}`}>
                  <f.i className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-lg font-bold">{f.t}</h3>
                <p className="text-sm text-slate-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools */}
      <section className="bg-slate-50 py-20 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-4xl">20+ AI <span className="gradient-text">vosita</span></h2>
            <p className="mt-2 text-slate-500">GroqCloud — eng tezkor AI inference</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[
              { i: Sparkles, l: 'G\'oya', c: 'text-violet-500' }, { i: TrendingUp, l: 'Biznes-plan', c: 'text-pink-500' },
              { i: Code, l: 'Kod', c: 'text-blue-500' }, { i: FileText, l: 'Rezyume', c: 'text-green-500' },
              { i: Globe, l: 'Tarjima', c: 'text-orange-500' }, { i: FileText, l: 'Blog', c: 'text-red-500' },
              { i: MessageCircle, l: 'Email', c: 'text-cyan-500' }, { i: Users, l: 'Pitch', c: 'text-amber-500' },
              { i: Crown, l: 'Brend', c: 'text-rose-500' }, { i: Sparkles, l: 'Boshqalar', c: 'text-violet-500' },
            ].map((t) => (
              <div key={t.l} className="card flex flex-col items-center gap-2 p-3 text-center transition hover:shadow-md">
                <t.i className={`h-6 w-6 ${t.c}`} /><span className="text-xs font-semibold">{t.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-4xl">Sodda <span className="gradient-text">narxlar</span></h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              { n: 'Free', p: 0, features: ['100 🪙 bonus', '5 AI so\'rov/kun', '1 ta startap', 'Bazaviy marketplace'] },
              { n: 'Pro', p: 99000, popular: true, features: ['500 🪙 har oy', '100 AI so\'rov/kun', '5 ta startap', 'Premium AI', 'Reklama yo\'q'] },
              { n: 'Business', p: 299000, features: ['2000 🪙 har oy', 'Cheksiz AI', 'Cheksiz startaplar', 'Maxsus modellar', 'API access'] },
            ].map((p) => (
              <div key={p.n} className={`card relative ${p.popular ? 'border-violet-500 ring-2 ring-violet-500' : ''}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">⭐ MASHHUR</span>}
                <h3 className="text-xl font-bold">{p.n}</h3>
                <div className="my-4 text-3xl font-black">{p.p === 0 ? 'Bepul' : `${p.p.toLocaleString()} so'm`}</div>
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> {f}</li>)}
                </ul>
                <Button variant={p.popular ? 'gradient' : 'outline'} fullWidth className="mt-4">
                  {p.p === 0 ? 'Bepul boshlash' : 'Tanlash'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-black md:text-4xl">Startapingizni bugun boshlang</h2>
          <p className="mt-2 opacity-90">100,000+ g'oyalar, minglab startaplar, bitta platforma</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register"><Button size="lg" className="bg-white text-violet-500 hover:bg-slate-100">Bepul ro'yxatdan o'tish</Button></Link>
            <Link href="/ai"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">AI Demo</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 00o.uz · Made with ❤️ in Uzbekistan</p>
          <p className="mt-2 text-xs">KRYZENSYS · <a href="https://t.me/ooouzbot" className="hover:underline">Telegram</a></p>
        </div>
      </footer>
    </div>
  );
}
