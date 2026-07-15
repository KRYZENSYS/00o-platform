'use client';
import { Check, Crown, Sparkles, Zap, BarChart3, Globe, Shield, Headphones, Star, TrendingUp, Users, Briefcase, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Boshlanish uchun',
    features: ['10 AI so\'rov/oy', '1 ta startap', 'Asosiy vositalar', 'Community support', '1 GB storage'],
    cta: 'Joriy tarif',
    current: true,
    color: 'border-slate-300',
  },
  {
    name: 'Pro',
    price: 99000,
    desc: 'Professional foydalanuvchilar uchun',
    features: ['Cheksiz AI', 'Cheksiz startaplar', 'Barcha vositalar', 'Prioritet support', 'Analytics', 'Custom branding', '100 GB storage', 'API access'],
    cta: 'Pro ga o\'tish',
    popular: true,
    color: 'border-violet-500',
  },
  {
    name: 'Business',
    price: 299000,
    desc: 'Jamoalar uchun',
    features: ['Hammasi Pro dan', '10 ta jamoa a\'zosi', 'Hamkasblar uchun AI', 'Jamoa analytics', 'White-label', '1 TB storage', 'SSO', 'Dedicated support'],
    cta: 'Business ga o\'tish',
    color: 'border-pink-500',
  },
  {
    name: 'Enterprise',
    price: null,
    desc: 'Katta kompaniyalar uchun',
    features: ['Hammasi Business dan', 'Cheksiz a\'zolar', 'On-premise deployment', 'Maxsus modellar', 'Custom development', 'SLA 99.9%', 'Shaxsiy menejer', '24/7 support'],
    cta: 'Bog\'lanish',
    color: 'border-amber-500',
  },
];

const COMPARISON = [
  { feature: 'AI so\'rovlar', free: '10/oy', pro: 'Cheksiz', business: 'Cheksiz', enterprise: 'Cheksiz' },
  { feature: 'AI modellar', free: 'Asosiy', pro: 'Barchasi', business: 'Barchasi + Fine-tune', enterprise: 'Maxsus' },
  { feature: 'Startap yaratish', free: '1', pro: 'Cheksiz', business: 'Cheksiz', enterprise: 'Cheksiz' },
  { feature: 'Marketplace', free: '✓', pro: '✓', business: '✓', enterprise: '✓' },
  { feature: 'Jamoa', free: '—', pro: '5 kishi', business: '10 kishi', enterprise: 'Cheksiz' },
  { feature: 'Storage', free: '1 GB', pro: '100 GB', business: '1 TB', enterprise: 'Cheksiz' },
  { feature: 'API', free: '—', pro: '✓', business: '✓', enterprise: '✓' },
  { feature: 'White-label', free: '—', pro: '—', business: '✓', enterprise: '✓' },
  { feature: 'SSO', free: '—', pro: '—', business: '✓', enterprise: '✓' },
  { feature: 'Support', free: 'Community', pro: 'Email', business: 'Prioritet', enterprise: '24/7 Dedicated' },
];

export default function PremiumPage() {
  return (
    <div className="space-y-12 p-4 md:p-8">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm">
          <Crown className="h-4 w-4 text-amber-500" /> Premium tariflar
        </div>
        <h1 className="bg-gradient-to-br from-white via-violet-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
          Kuchliroq imkoniyatlar
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Sizning ehtiyojlaringiz uchun mos tarifni tanlang. Pro bilan cheksiz AI va barcha vositalar.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.name} className={cn('relative rounded-2xl border-2 p-6 transition-all', p.color, p.popular ? 'shadow-2xl shadow-violet-500/30' : 'bg-white dark:bg-slate-900')}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                ✨ Eng mashhur
              </div>
            )}
            {p.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-white">Joriy</div>
            )}
            <h3 className="text-2xl font-bold">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
            <div className="mt-4 flex items-baseline gap-1">
              {p.price === null ? (
                <span className="text-3xl font-bold">Aloqada</span>
              ) : (
                <>
                  <span className="text-4xl font-bold">{p.price.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">so'm/oy</span>
                </>
              )}
            </div>
            <ul className="mt-6 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" /> <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full" variant={p.popular ? 'gradient' : p.current ? 'outline' : 'default'} disabled={p.current}>
              {p.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Features */}
      <div>
        <h2 className="text-center text-3xl font-bold">Nega Premium?</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Sparkles, t: 'Cheksiz AI', d: 'Barcha modellar va vositalar', color: 'from-violet-500 to-purple-600' },
            { i: Zap, t: 'Tezroq', d: 'Prioritet serverlar', color: 'from-amber-500 to-orange-600' },
            { i: BarChart3, t: 'Analytics', d: 'Batafsil statistika', color: 'from-blue-500 to-cyan-600' },
            { i: Globe, t: 'API Access', d: 'O\'z ilovalaringiz uchun', color: 'from-green-500 to-emerald-600' },
            { i: Shield, t: 'Xavfsizlik', d: '2FA, SSO, audit', color: 'from-red-500 to-pink-600' },
            { i: Headphones, t: '24/7 Support', d: 'Prioritet yordam', color: 'from-fuchsia-500 to-pink-600' },
            { i: Users, t: 'Jamoa', d: '10+ a\'zo bilan ishlash', color: 'from-indigo-500 to-violet-600' },
            { i: Crown, t: 'White-label', d: 'O\'z brendingiz', color: 'from-amber-500 to-yellow-600' },
          ].map((f) => (
            <Card key={f.t} className="text-center">
              <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white', f.color)}>
                <f.i className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.d}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div>
        <h2 className="text-center text-3xl font-bold">Taqqoslash</h2>
        <Card className="mt-8 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-left">Funksiya</th>
                <th className="p-4 text-center">Free</th>
                <th className="p-4 text-center bg-violet-500/5">Pro</th>
                <th className="p-4 text-center">Business</th>
                <th className="p-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="p-4 font-medium">{r.feature}</td>
                  <td className="p-4 text-center text-slate-500">{r.free}</td>
                  <td className="p-4 text-center font-semibold text-violet-500">{r.pro}</td>
                  <td className="p-4 text-center text-slate-500">{r.business}</td>
                  <td className="p-4 text-center text-slate-500">{r.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-center text-3xl font-bold">Foydalanuvchilar nima deydi</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { n: 'Aziz K.', t: 'Startup founder', q: 'Pro tarifga o\'tgach, 3 oyda 50K foydalanuvchiga yetdik! AI tools ajoyib ishlaydi.' },
            { n: 'Malika Y.', t: 'Designer', q: 'AI image generation va marketing strategiya - ikkalasi ham juda foydali.' },
            { n: 'Bobur E.', t: 'Investor', q: 'Analytics va matching funksiyasi investitsiyalarim samaradorligini oshirdi.' },
          ].map((t, i) => (
            <Card key={i}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="mt-3 text-sm">"{t.q}"</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                <div>
                  <p className="text-sm font-semibold">{t.n}</p>
                  <p className="text-[10px] text-slate-500">{t.t}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600 p-12 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-white" />
        <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Bugun Pro ga o'ting</h2>
        <p className="mt-2 text-white/90">7 kun bepul sinab ko'ring. Hech qanday yashirin to'lov yo'q.</p>
        <Button className="mt-6 bg-white text-violet-600 hover:bg-white/90">Bepul sinash <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
