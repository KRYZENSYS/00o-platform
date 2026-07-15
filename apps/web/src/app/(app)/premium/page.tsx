'use client';
import { useState } from 'react';
import { Crown, Check, Zap, MessageCircle, Sparkles, Shield, Star, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const PLANS = [
  {
    id: 'pro', name: 'Pro', price: 99000, popular: true,
    features: [
      { t: '500 🪙 har oy', ok: true }, { t: '100 AI so\'rov/kun', ok: true }, { t: '5 ta startap', ok: true },
      { t: 'Premium AI modellar (Llama 70B)', ok: true }, { t: 'Reklama yo\'q', ok: true },
      { t: 'Prioritet qo\'llab-quvvatlash', ok: true }, { t: 'Export PDF/Word', ok: true },
    ],
  },
  {
    id: 'business', name: 'Business', price: 299000,
    features: [
      { t: '2000 🪙 har oy', ok: true }, { t: 'Cheksiz AI so\'rov', ok: true }, { t: 'Cheksiz startap', ok: true },
      { t: 'Barcha AI modellar', ok: true }, { t: 'API access', ok: true },
      { t: 'Maxsus modellar (fine-tune)', ok: true }, { t: 'Jamoa (10 tagacha)', ok: true },
      { t: 'White-label', ok: true },
    ],
  },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const subscribe = async (planId: string) => {
    setLoading(planId); setMsg('');
    try {
      const r = await api.payments.create({ plan: planId });
      if (r.data?.checkout_url) window.location.href = r.data.checkout_url;
      else setMsg('To\'lov tizimiga yo\'naltirildi');
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'To\'lov vaqtincha mavjud emas');
    } finally { setLoading(null); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl">
          <Crown className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black">Premiumga o\'ting</h1>
        <p className="mt-2 text-slate-500">Cheksiz imkoniyatlar, yuqori sifat, prioritet qo\'llab-quvvatlash</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.id} className={cn('relative', p.popular && 'border-violet-500 ring-2 ring-violet-500')}>
            {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">⭐ MASHHUR</span>}
            <CardContent className="p-6">
              <h3 className="text-2xl font-black">{p.name}</h3>
              <div className="my-3 text-3xl font-black">{p.price.toLocaleString()} <span className="text-base text-slate-500">so\'m/oy</span></div>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f.t} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-500" /> {f.t}
                  </li>
                ))}
              </ul>
              <Button onClick={() => subscribe(p.id)} variant={p.popular ? 'gradient' : 'outline'} fullWidth className="mt-4" loading={loading === p.id}>
                <Crown className="h-4 w-4" /> {p.popular ? 'Pro\'ga o\'tish' : 'Tanlash'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {msg && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-sm text-amber-500">{msg}</div>}

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-black">Premium afzalliklari</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Sparkles, t: 'Yuqori sifat AI', d: 'Llama 70B, Mixtral — eng kuchli modellar' },
              { i: Zap, t: 'Tezkor', d: 'Birinchi navbatda javob, 0 kutish' },
              { i: Shield, t: 'Xavfsiz', d: 'Barcha ma\'lumotlar shifrlangan' },
              { i: MessageCircle, t: '24/7 Support', d: 'Prioritet qo\'llab-quvvatlash' },
            ].map((b) => (
              <div key={b.t} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <b.i className="h-5 w-5 text-violet-500" />
                <div className="mt-1 font-bold">{b.t}</div>
                <p className="text-xs text-slate-500">{b.d}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
