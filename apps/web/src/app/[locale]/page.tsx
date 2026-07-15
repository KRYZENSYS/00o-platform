'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, CheckSquare, MessageCircle, Target, Wallet, Heart, Brain, Zap, Shield, Globe, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: CheckSquare, title: 'Vazifalar', desc: 'Kundalik vazifalaringizni boshqaring', color: 'from-violet-500 to-purple-600' },
  { icon: StickyNoteIcon, title: 'Eslatmalar', desc: 'Fikrlaringizni saqlang', color: 'from-pink-500 to-rose-600' },
  { icon: Target, title: 'Odatlar', desc: 'Yaxshi odatlar yarating', color: 'from-orange-500 to-amber-600' },
  { icon: MessageCircle, title: 'Ijtimoiy', desc: 'Do\'stlaringiz bilan bog\'laning', color: 'from-blue-500 to-cyan-600' },
  { icon: Wallet, title: 'Moliya', desc: 'Byudjet va tranzaksiyalar', color: 'from-green-500 to-emerald-600' },
  { icon: Heart, title: 'Sog\'liq', desc: 'Suv, uyqu, kayfiyat', color: 'from-red-500 to-pink-600' },
  { icon: Brain, title: 'AI Yordamchi', desc: 'Sun\'iy intellekt maslahatchi', color: 'from-indigo-500 to-violet-600' },
  { icon: Bot, title: 'Telegram Bot', desc: '30+ buyruq', color: 'from-sky-500 to-blue-600' },
];

function StickyNoteIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>; }

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-surface/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-glow">∞</div>
            <span className="text-xl font-bold">00o.uz</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm text-text-muted hover:text-text">Imkoniyatlar</Link>
            <Link href="#pricing" className="text-sm text-text-muted hover:text-text">Narxlar</Link>
            <Link href="#about" className="text-sm text-text-muted hover:text-text">Haqida</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link href="/login">Kirish</Link></Button>
            <Button asChild><Link href="/register">Boshlash <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-mesh" />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-300 to-brand-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="container py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-sm text-brand-600 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> 50+ ilova, 1 ta platforma
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Hayotingizni <span className="bg-gradient-to-r from-brand-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">boshqaring</span>
            </h1>
            <p className="mt-6 text-lg text-text-muted sm:text-xl">
              00o.uz — O'zbek tilidagi eng katta platforma. Vazifalar, moliya, sog'liq, ijtimoiy tarmoq, AI yordamchi — barchasi bir joyda.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="xl" asChild><Link href="/register">Bepul boshlash <ArrowRight className="h-5 w-5" /></Link></Button>
              <Button size="xl" variant="outline" asChild><Link href="#features">Batafsil</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
              <div className="flex items-center gap-1"><Shield className="h-4 w-4" /> Xavfsiz</div>
              <div className="flex items-center gap-1"><Zap className="h-4 w-4" /> Tez</div>
              <div className="flex items-center gap-1"><Globe className="h-4 w-4" /> 10 til</div>
              <div className="flex items-center gap-1"><Bot className="h-4 w-4" /> Telegram bot</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Hammasi bir joyda</h2>
          <p className="mt-4 text-lg text-text-muted">Hayotning barcha sohalarini qamrab oluvchi ilovalar</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-brand-500/50 hover:shadow-glow"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container py-20">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-brand-500/10 via-pink-500/5 to-orange-500/10 p-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[{ n: '50+', l: 'Ilovalar' }, { n: '10', l: 'Til' }, { n: '99.9%', l: 'Uptime' }, { n: '24/7', l: 'Qo\'llab-quvvatlash' }].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-4xl font-bold sm:text-5xl">{s.n}</div>
                <div className="mt-1 text-sm text-text-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-mesh opacity-30" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Bugun boshlang</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">Bepul ro'yxatdan o'ting va hayotingizni o'zgartiring</p>
            <Button size="xl" variant="secondary" className="mt-8" asChild>
              <Link href="/register">Ro'yxatdan o'tish <ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-text-muted md:flex-row">
          <p>© 2026 00o.uz. KRYZENSYS tomonidan yaratilgan.</p>
          <div className="flex gap-6">
            <Link href="/about">Haqida</Link>
            <Link href="/privacy">Maxfiylik</Link>
            <Link href="/terms">Shartlar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
