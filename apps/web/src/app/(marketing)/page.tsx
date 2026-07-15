import Link from 'next/link';
import { Sparkles, Rocket, Users, Briefcase, TrendingUp, Award, Zap, Code, MessageSquare, Globe, Target, DollarSign, ArrowRight, Star, CheckCircle2, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 font-bold shadow-lg shadow-pink-500/30">∞</div>
            <span className="text-xl font-bold">00o.uz</span>
          </Link>
          <div className="hidden gap-8 md:flex">
            <Link href="#features" className="text-sm text-slate-300 hover:text-white">Imkoniyatlar</Link>
            <Link href="#startups" className="text-sm text-slate-300 hover:text-white">Startaplar</Link>
            <Link href="#ai" className="text-sm text-slate-300 hover:text-white">AI</Link>
            <Link href="#pricing" className="text-sm text-slate-300 hover:text-white">Narxlar</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden rounded-lg px-4 py-2 text-sm hover:bg-white/10 sm:block">Kirish</Link>
            <Link href="/register" className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-pink-500/30 hover:scale-105">Boshlash</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>O'zbekistondagi #1 AI Startup Hub</span>
            </div>
            <h1 className="text-balance bg-gradient-to-br from-white via-violet-200 to-pink-200 bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent md:text-7xl">
              Startaplar, frilanserlar va investorlar bir joyda
            </h1>
            <p className="mt-6 text-balance text-lg text-slate-300 md:text-xl">
              00o.uz — AI bilan ishlaydigan platforma: startaplar yaratish, frilans xizmatlar, investitsiya topish va ajoyib g'oyalarni hayotga tatbiq etish.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register" className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 px-8 py-4 font-semibold shadow-2xl shadow-pink-500/30 hover:scale-105">Bepul boshlash →</Link>
              <button className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold backdrop-blur hover:bg-white/10">▶ Demo</button>
            </div>
            <div className="mt-12 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
              {[{ v: '50K+', l: 'Foydalanuvchi', i: Users }, { v: '2.5K+', l: 'Startap', i: Rocket }, { v: '8K+', l: 'Frilanser', i: Briefcase }, { v: '$12M+', l: 'Investitsiya', i: DollarSign }].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white"><s.i className="h-5 w-5" /></div>
                  <p className="text-3xl font-bold">{s.v}</p>
                  <p className="text-sm text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/5 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Hammasi sizning g'oyalaringiz uchun</h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Rocket, t: 'Startup Hub', d: 'Startap yarating, moliya toping va jamoa quring' },
              { i: Briefcase, t: 'Freelancer Market', d: 'Xizmatlarni taklif qiling va buyurtmalar qabul qiling' },
              { i: TrendingUp, t: 'Investor Platform', d: 'Startaplarga sarmoya kiriting va daromad oling' },
              { i: Sparkles, t: 'AI Assistant', d: 'GroqCloud bilan ishlaydigan 20+ AI vositasi' },
              { i: Users, t: 'Team Builder', d: 'Hamkasblar va co-founder toping' },
              { i: Code, t: 'Code AI', d: 'Kod generatsiya, review va bug fixing' },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-white/20">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white"><f.i className="h-6 w-6" /></div>
                <h3 className="text-xl font-bold">{f.t}</h3>
                <p className="mt-2 text-slate-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="border-t border-white/5 py-20">
        <div className="container mx-auto grid items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <h2 className="bg-gradient-to-br from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">GroqCloud AI bilan kuchliroq</h2>
            <p className="mt-4 text-lg text-slate-400">Llama 3.3 70B, DeepSeek R1, Qwen 2.5 — eng ilg'or modellar bilan integratsiyalashgan.</p>
            <ul className="mt-8 space-y-3">
              {['Startup idea generator', 'Business plan AI', 'Pitch deck creator', 'Code generation & review', 'SQL & API docs', 'Marketing strategy'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-300">✓ {f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 px-4 py-2 text-sm">Menga startup g'oya kerak</div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  💡 <strong>3 ta FinTech g'oya:</strong><br />1. O'zbek tilida AI chatbot bank<br />2. Kichik biznes CRM<br />3. Crypto-portfel boshqaruvi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-white/5 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-4xl font-bold md:text-5xl">Sizga mos tarifni tanlang</h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { n: 'Free', p: '0', f: ['10 AI so\'rov', 'Asosiy funksiyalar', '1 startap', 'Community'] },
              { n: 'Pro', p: '99,000', pop: true, f: ['Cheksiz AI', 'Barcha funksiyalar', 'Cheksiz startap', 'Prioritet support', 'Analytics'] },
              { n: 'Enterprise', p: 'Aloqada', f: ['Hammasi Pro dan', 'Maxsus modellar', 'API access', 'White-label', 'Shaxsiy menejer'] },
            ].map((p) => (
              <div key={p.n} className={`rounded-2xl border p-6 ${p.pop ? 'border-violet-500 bg-gradient-to-br from-violet-500/10 to-pink-500/10' : 'border-white/10 bg-white/5'} backdrop-blur`}>
                {p.pop && <div className="mb-3 inline-block rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1 text-xs font-semibold">Mashhur</div>}
                <h3 className="text-2xl font-bold">{p.n}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.p}</span>
                  {p.p !== 'Aloqada' && <span className="text-slate-400">so'm/oy</span>}
                </div>
                <ul className="mt-6 space-y-2">
                  {p.f.map((x) => <li key={x} className="flex items-center gap-2 text-sm text-slate-300">✓ {x}</li>)}
                </ul>
                <Link href="/register" className={`mt-6 block rounded-xl py-3 text-center font-semibold ${p.pop ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-white/10 hover:bg-white/20'}`}>Boshlash</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600 p-12 text-center md:p-16">
            <Zap className="mx-auto h-12 w-12 text-white/80" />
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">Bugun boshlang, ertaga muvaffaqiyat</h2>
            <p className="mt-4 text-lg text-white/90">50,000+ foydalanuvchi bizga qo'shildi. Siz ham!</p>
            <Link href="/register" className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-violet-600 shadow-2xl hover:scale-105">Bepul ro'yxatdan o'tish →</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <p>© 2026 00o.uz. Barcha huquqlar himoyalangan. Toshkent, O'zbekiston 🇺🇿</p>
        </div>
      </footer>
    </main>
  );
}
