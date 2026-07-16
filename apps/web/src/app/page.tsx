'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Rocket, Briefcase, Users, DollarSign, Globe, Crown, Check, TrendingUp, MessageCircle, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 text-white">
      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
        <div className="absolute -right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -left-20 bottom-20 h-72 w-72 animate-pulse rounded-full bg-pink-500/30 blur-3xl" />

        <div className="container relative mx-auto flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 text-center">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-white/5 px-4 py-1.5 text-xs font-medium backdrop-blur dark:bg-slate-900/50 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <Sparkles className="h-3 w-3 text-violet-500" />
            <span>🚀 O'zbekistondagi #1 AI Startup Hub</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl lg:text-7xl">
            <span className="block">Kelajakni</span>
            <span className="block gradient-text animate-gradient bg-[length:200%_200%]">bugun quring</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-slate-300 dark:text-slate-300 md:text-lg">
            AI yordamchi, startup ekotizimi, professional xizmatlar va investorlar bir joyda — bitta platformada.
            20+ AI vosita, 5 ta til modeli, real-time chat va undan ko'p.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register"><Button size="lg" variant="gradient">Bepul boshlash <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/ai"><Button size="lg" variant="outline"><Sparkles className="h-4 w-4" /> AI ni sinab ko'ring</Button></Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 100% bonus</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 20+ AI tool</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 5 languages</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> 100% free start</span>
          </div>
        </div>
      </section>

      <section className="container relative mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">Hammasi bir platformada</h2>
          <p className="text-slate-400">Startup, frilanser, investor va AI — birlashtirilgan ekosistema</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Rocket, title: 'Startup Marketplace', desc: "O'z startapingizni yarating va moliya toping" },
            { icon: Briefcase, title: 'Frilanser Platform', desc: "Professional xizmatlar va buyurtmalar" },
            { icon: Sparkles, title: 'AI Tools Hub', desc: "20+ AI vosita — yozish, kod, tarjima, rasm" },
            { icon: DollarSign, title: 'Investor Network', desc: "Angel investorlar va VC fondlar" },
            { icon: Users, title: 'Jamoa', desc: "Talent pool va co-founder matching" },
            { icon: Globe, title: 'Multi-language', desc: "O'zbek, Rus, Ingliz, Hindi, Arabic" },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-violet-500/50 hover:bg-white/10">
              <f.icon className="mb-4 h-10 w-10 text-violet-400" />
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>© 2026 00o.uz — Made with ❤️ in Uzbekistan</p>
      </footer>
    </div>
  );
}
