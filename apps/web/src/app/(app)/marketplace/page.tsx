'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Briefcase, Star, Clock, DollarSign, Plus, Filter, Tag, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const CATS = ['all', 'design', 'development', 'marketing', 'content', 'ai', 'consulting'] as const;
const CAT_LABELS: Record<string, string> = { all: 'Hammasi', design: 'Dizayn', development: 'Dasturlash', marketing: 'Marketing', content: 'Kontent', ai: 'AI/ML', consulting: 'Konsultatsiya' };

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.marketplace.list({ category: cat === 'all' ? undefined : cat, q: q || undefined });
      const d = r.data || {};
      setItems(d.items || d.results || d || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [cat]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Marketplace</h1>
          <p className="text-sm text-slate-500">Professional xizmatlar va freelancerlar</p>
        </div>
        <Link href="/marketplace/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Xizmat qo\'shish</Button></Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Xizmat qidirish..." className="pl-10" />
        </div>
        <Button onClick={load} variant="outline"><Filter className="h-4 w-4" /> Filtrlash</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${cat === c ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}`}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>)}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Briefcase className="h-12 w-12 text-slate-300" />
          <h3 className="font-bold">Xizmat topilmadi</h3>
          <p className="text-sm text-slate-500">Birinchi bo\'lib xizmat qo\'shing!</p>
          <Link href="/marketplace/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Qo\'shish</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s: any) => (
            <Link key={s.id} href={`/marketplace/${s.id}`}>
              <Card className="group h-full transition hover:shadow-xl">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10">
                    <Briefcase className="h-10 w-10 text-violet-500" />
                  </div>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-bold group-hover:text-violet-500">{s.title}</h3>
                    <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-500">{CAT_LABELS[s.category] || s.category}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-500">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3 w-3" /> {s.seller?.first_name || 'Seller'}
                      <Star className="ml-2 h-3 w-3 text-amber-500" /> {s.rating || 4.8}
                    </div>
                    <div className="text-sm font-black text-violet-500">${s.price_from}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
