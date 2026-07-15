'use client';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Globe, Mail, MapPin, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function InvestorsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.investors.list({ q: q || undefined })
      .then((r) => setItems(r.data?.items || r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Investorlar</h1>
        <p className="text-sm text-slate-500">Venchur fondlar, angel investorlar, strategik sheriklar</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Investor qidirish..." className="pl-10" />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-40" /></Card>)}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <DollarSign className="h-12 w-12 text-slate-300" />
          <h3 className="font-bold">Investorlar topilmadi</h3>
          <p className="text-sm text-slate-500">Tez kunda qo\'shiladi</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i: any) => (
            <Card key={i.id} className="transition hover:shadow-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10">
                  <DollarSign className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-sm font-bold">{i.name}</h3>
                <p className="line-clamp-2 text-xs text-slate-500">{i.description}</p>
                <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  {i.check_size && <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> ${i.check_size}</div>}
                  {i.location && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {i.location}</div>}
                  {i.website && <div className="flex items-center gap-1"><Globe className="h-3 w-3" /> <a href={i.website} target="_blank" rel="noreferrer" className="text-violet-500 hover:underline">{i.website}</a></div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="gradient" className="flex-1"><Mail className="h-3.5 w-3.5" /> Murojaat</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
