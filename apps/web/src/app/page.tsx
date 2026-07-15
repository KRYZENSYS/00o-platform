'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, Rocket, Briefcase, DollarSign, Users, TrendingUp,
  ArrowRight, Check, Star, Globe, Zap, Shield, Crown, Code, BarChart3,
  MessageCircle, Bell, Calendar, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-base font-bold text-white">∞</div>
            <span className="text-lg font-bold">00o.uz</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Imkoniyatlar</a>
            <a href="#ai" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">AI</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Narxlar</a>
            <a href="#startups" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Startaplar</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"><Button variant="ghost" size="sm">Kirish</Button></Link>
            <Link href="/auth/register"><Button size="sm">Boshlash</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-sm font-medium text-violet-500">
              <Sparkles className="h-3.5 w-3.5" />
              O'zbekistondagi #1 AI Startup Hub
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">G'oyangizni</span>
              <br />
              <span>global startapga aylantiring</span>
            </h1>
            <p className="mb-8 text-lg text-slate-600 dark:text-slate-400 md:text-xl">
              AI yordamida startap yarating, jamoa toping, investor jalb qiling, professional xizmatlarni sotib oling.
              Hammasi <strong className="text-slate-900 dark:text-white">bitta platformada</strong>.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/register"><Button size="lg" variant="gradient" className="w-full sm:w-auto">
                Bepul boshlash <ArrowRight className="h-4 w-4" />
              </Button></Link>
              <Link href="/ai"><Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" /> AI bilan sinab ko'rish
              </Button></Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> Kredit kartasiz</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> 100 🪙 bonus</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-500" /> 5 daqiqada tayyor</div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { v: '12,500+', l: 'Foydalanuvchi' },
              { v: '850+', l: 'Startap' },
              { v: '2,300+', l: 'Xizmat' },
              { v: '$1.2M+', l: 'Investitsiya' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-2xl font-bold md:text-3xl">{s.v}</div>
                <div className="mt-1 text-xs text-slate-500 md:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Hamma narsa bir joyda</h2>
            <p className="text-slate-600 dark:text-slate-400">Startap ekotizimingiz uchun kerak bo'lgan barcha vositalar</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Sparkles, c: 'from-violet-500 to-pink-500', t: 'AI yordamchi', d: '20+ AI vositalar: g\'oya, biznes-plan, kod, tarjima, kontent yaratish' },
              { i: Rocket, c: 'from-pink-500 to-orange-500', t: 'Startap yaratish', d: 'G\'oyadan to MVPgacha - tez va oson, jamoa bilan birga' },
              { i: Users, c: 'from-orange-500 to-yellow-500', t: 'Jamoa topish', d: 'Co-founder, dasturchi, dizayner, marketolog toping' },
              { i: DollarSign, c: 'from-green-500 to-emerald-500', t: 'Investorlar', d: 'Angel investorlar va VC fondlar bilan bog\'laning' },
              { i: Briefcase, c: 'from-blue-500 to-cyan-500', t: 'Marketplace', d: 'Xizmatlarni sotib oling va soting - dizayn, dev, marketing' },
              { i: TrendingUp, c: 'from-purple-500 to-violet-500', t: 'Ish o\'rinlari', d: 'Eng yaxshi startaplarda ish toping yoki jamoangizni kengaytiring' },
            ].map((f) => (
              <div key={f.t} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-violet-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.c} text-white`}>
                  <f.i className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{f.t}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-500">
                <Sparkles className="h-3.5 w-3.5" /> GroqCloud + Llama 3.3
              </div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Eng kuchli AI yordamchi</h2>
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                20+ AI vositalar sizning g'oyalaringizni tezlashtiradi. Startup g'oya, biznes-plan, kod yozish, marketing kontent - hammasi bir chatda.
              </p>
              <div className="space-y-3">
                {[
                  '💡 Startup g\'oya generatori',
                  '📊 Biznes-plan yaratish',
                  '💻 Kod yozish va tekshirish (Qwen Coder 32B)',
                  '📝 Rezyume va cover letter',
                  '🌐 Tarjima (60+ til)',
                  '📱 Ijtimoiy tarmoq postlari',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-violet-500" /> {f}</div>
                ))}
              </div>
              <Link href="/ai" className="mt-6 inline-block">
                <Button variant="gradient" size="lg">AI bilan boshlash <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-3">
                {[
                  { r: 'user', c: 'Menga AI startup g\'oya kerak. Byudjet 100M so\'m.' },
                  { r: 'ai', c: '💡 EduTech AI Tutor: O\'zbek tilidagi shaxsiy repetitor...\n\n• MVP: 3 oy\n• Bozor: 5M+ o\'quvchi\n• Revenue: 99K so\'m/oy' },
                  { r: 'user', c: 'Biznes-plan yoz' },
                  { r: 'ai', c: '📊 1. Executive Summary\n2. Market Analysis (5M addressable)\n3. Revenue Model (SaaS freemium)\n4. Financial Projections\n5. Funding Required: $50K seed' },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.r === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${m.r === 'user' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                      {m.c}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Sizga mos tarif</h2>
            <p className="text-slate-600 dark:text-slate-400">Bepul boshlang, kerak bo'lganda yangilang</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Free', price: '0', period: 'doim', features: ['100 🪙 bonus', '10 AI so\'rov/kun', '1 startap', 'Marketplace', 'Feed', 'Jamoa topish'], cta: 'Bepul boshlash', featured: false },
              { name: 'Pro', price: '99 000', period: 'oyiga', features: ['500 🪙 bonus', '100 AI so\'rov/kun', '5 startap', 'Premium AI modellar', 'Prioritet support', 'Analytics', 'Reklama yo\'q'], cta: 'Pro ga o\'tish', featured: true },
              { name: 'Business', price: '299 000', period: 'oyiga', features: ['2000 🪙 bonus', '1000 AI so\'rov/kun', '∞ startap', 'Jamoa (10 tagacha)', 'API access', 'Custom AI model', 'White-label'], cta: 'Business ga o\'tish', featured: false },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-3xl border p-6 ${p.featured ? 'border-violet-500 bg-white shadow-2xl shadow-violet-500/10 dark:bg-slate-900' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-0.5 text-xs font-bold text-white">Mashhur</div>}
                <h3 className="mb-1 text-2xl font-bold">{p.name}</h3>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-slate-500">/ {p.period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-violet-500" /> {f}</li>
                  ))}
                </ul>
                <Link href="/auth/register"><Button variant={p.featured ? 'gradient' : 'outline'} fullWidth>{p.cta}</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 p-8 text-center text-white md:p-12">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Tayyor boshlashga?</h2>
            <p className="mb-6 opacity-90">12,500+ foydalanuvchi va 850+ startap bizga qo'shildi</p>
            <Link href="/auth/register"><Button size="lg" className="bg-white text-violet-500 hover:bg-slate-100">Bepul ro'yxatdan o'tish</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-sm font-bold text-white">∞</div>
              <span className="font-bold">00o.uz</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 00o.uz — O'zbekistondagi AI Startup Hub</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
