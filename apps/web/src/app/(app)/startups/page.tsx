'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Rocket, Users, TrendingUp, Filter, MapPin, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const STAGES = ['all', 'idea', 'mvp', 'growth', 'scaling'] as const;
const STAGE_LABELS: Record<string, string> = { all: 'Hammasi', idea: 'G\'oya', mvp: 'MVP', growth: 'O\'sish', scaling: 'Masshtablash' };
const STAGE_COLORS: Record<string, string> = { idea: 'bg-slate-500', mvp: 'bg-blue-500', growth: 'bg-green-500', scaling: 'bg-violet-500' };

export default function StartupsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.startups.list({ stage: stage === 'all' ? undefined : stage, q: q || undefined, page });
      const d = r.data || {};
      setItems(d.items || d.results || d || []);
      setTotal(d.total || d.length || 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [stage, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Startaplar <span className="text-slate-400 text-lg">({total})</span></h1>
          <p className="text-sm text-slate-500">Yangi g\'oyalar, jamoa va investorlar</p>
        </div>
        <Link href="/startups/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Startap yaratish</Button></Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Startap qidirish..." className="pl-10" />
        </div>
        <Button onClick={load} variant="outline"><Filter className="h-4 w-4" /> Filtrlash</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGES.map((s) => (
          <button key={s} onClick={() => { setStage(s); setPage(1); }} className={cn('rounded-full border px-3 py-1 text-xs font-semibold transition', stage === s ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300')}>
            {STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-32 rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>)}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Rocket className="h-12 w-12 text-slate-300" />
          <h3 className="font-bold">Startap topilmadi</h3>
          <p className="text-sm text-slate-500">Birinchi bo\'lib startap yarating!</p>
          <Link href="/startups/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Yaratish</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s: any) => (
            <Link key={s.id} href={`/startups/${s.id}`}>
              <Card className="group h-full transition hover:shadow-xl">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md">
                      <Rocket className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold group-hover:text-violet-500">{s.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {s.location || 'Toshkent'}
                      </div>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold text-white', STAGE_COLORS[s.stage] || 'bg-slate-500')}>
                      {STAGE_LABELS[s.stage] || s.stage}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-500">{s.tagline || s.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.industry && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-900">{s.industry}</span>}
                    {s.tags?.slice(0, 2).map((t: string) => (
                      <span key={t} className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-500">#{t}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.team_size || 1}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {s.views || 0}</span>
                    {s.website_url && <Globe className="h-3 w-3" />}
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
