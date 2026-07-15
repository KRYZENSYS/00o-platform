'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Check, Sparkles, Zap, Brain, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const features = [
  { icon: Check, label: 'Cheksiz vazifalar va eslatmalar' },
  { icon: Brain, label: 'AI yordamchi — shaxsiy maslahatchi' },
  { icon: Zap, label: 'Tezkor sinxronizatsiya' },
  { icon: Shield, label: 'Kengaytirilgan xavfsizlik' },
  { icon: Download, label: 'Ma\'lumot eksporti (PDF, Excel)' },
  { icon: Sparkles, label: 'Premium dizayn va emojilar' },
];

export default function PremiumPage() {
  const { data: plans } = useSWR('/payments/plans', () => api.getPlans());
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await api.createPaymePayment(plan);
      if (res.url) window.location.href = res.url;
    } catch (err: any) { toast.error(err.message); }
    setLoading(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-glow">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-4xl font-bold">Premium ga o'ting</h1>
        <p className="mt-2 text-text-muted">Barcha imkoniyatlardan foydalaning</p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {plans?.data && Object.entries(plans.data).filter(([k]) => k.includes('PRO')).map(([key, plan]: any) => {
          const isYearly = key.includes('YEARLY');
          const monthly = isYearly ? plan.amount / 12 : plan.amount;
          return (
            <Card key={key} className={cn('relative', key === 'PRO_YEARLY' && 'border-brand-500 shadow-glow')}>
              {key === 'PRO_YEARLY' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">-17%</span>
              )}
              <h3 className="text-xl font-bold">{isYearly ? 'Yillik' : 'Oylik'}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{formatCurrency(monthly)}</span>
                <span className="text-text-muted">/oy</span>
              </div>
              <p className="mt-1 text-sm text-text-muted">{isYearly ? `Yiliga ${formatCurrency(plan.amount)}` : `Oyiga ${formatCurrency(plan.amount)}`}</p>
              <ul className="mt-6 space-y-2">
                {features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" /> {f.label}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" size="lg" loading={loading === key} onClick={() => subscribe(key)}>
                Obuna bo'lish
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
