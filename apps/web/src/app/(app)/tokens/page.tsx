'use client';
import { useEffect, useState } from 'react';
import { Coins, Plus, Gift, TrendingUp, Sparkles, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const PACKS = [
  { tokens: 100, price: 9000, label: 'Starter' },
  { tokens: 500, price: 39000, label: 'Standard', popular: true },
  { tokens: 1000, price: 69000, label: 'Pro' },
  { tokens: 5000, price: 299000, label: 'Business' },
];

export default function TokensPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = async () => {
    const [w, h] = await Promise.allSettled([api.users.wallet(), api.users.tokenHistory()]);
    if (w.status === 'fulfilled') setBalance(w.value.data?.balance || 0);
    if (h.status === 'fulfilled') setHistory(h.value.data?.items || h.value.data || []);
  };

  useEffect(() => { load(); }, []);

  const buy = async (tokens: number) => {
    setLoading(String(tokens));
    try {
      const r = await api.payments.buyTokens({ amount: tokens });
      if (r.data?.checkout_url) window.location.href = r.data.checkout_url;
    } catch { /* ignore */ }
    finally { setLoading(null); }
  };

  const claim = async () => {
    try {
      const r = await api.users.claimDaily();
      setBalance((b) => b + (r.data?.tokens || 10));
    } catch { /* ignore */ }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm opacity-90">Joriy balans</div>
          <div className="mt-1 flex items-baseline gap-2">
            <Coins className="h-10 w-10" />
            <span className="text-5xl font-black">{balance}</span>
            <span className="text-xl">🪙</span>
          </div>
          <Button onClick={claim} className="mt-3 bg-white text-amber-500 hover:bg-slate-100">
            <Gift className="h-4 w-4" /> Kunlik bonus (+10 🪙)
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-bold">Token sotib olish</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PACKS.map((p) => (
            <Card key={p.tokens} className={cn('relative', p.popular && 'border-violet-500 ring-2 ring-violet-500')}>
              {p.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">⭐</span>}
              <CardContent className="p-4 text-center">
                <Coins className="mx-auto h-8 w-8 text-amber-500" />
                <div className="mt-2 text-2xl font-black">{p.tokens.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">token</div>
                <div className="my-2 text-lg font-bold">{p.price.toLocaleString()} so'm</div>
                <Button onClick={() => buy(p.tokens)} variant={p.popular ? 'gradient' : 'outline'} fullWidth size="sm" loading={loading === String(p.tokens)}>
                  Sotib olish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Tranzaksiyalar tarixi</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">Hozircha tranzaksiyalar yo\'q</p>
          ) : (
            <div className="space-y-2">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', h.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                    {h.amount > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{h.description || h.type}</div>
                    <div className="text-[10px] text-slate-500">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <div className={cn('text-sm font-bold', h.amount > 0 ? 'text-green-500' : 'text-red-500')}>
                    {h.amount > 0 ? '+' : ''}{h.amount} 🪙
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
