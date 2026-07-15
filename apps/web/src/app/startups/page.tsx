'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket, Search, Plus, Filter, Eye, Heart, Crown, TrendingUp, MapPin, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { formatNumber, cn } from '@/lib/utils';

const STAGES = ['all', 'idea', 'mvp', 'beta', 'launched', 'growth', 'scale'];
const CATEGORIES = ['all', 'EdTech', 'FinTech', 'HealthTech', 'E-commerce', 'AI', 'SaaS', 'Marketplace', 'Logistics', 'AgriTech', 'Travel', 'Food', 'Gaming', 'Other'];

export default function StartupsListPage() {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('trending');
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, [stage, category, sort]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.startups.list({
        q: q || undefined,
        stage: stage === 'all' ? undefined : stage,
        category: category === 'all' ? undefined : category,
        sort,
        limit: 24,
      });
      setStartups(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    setPage(1);
    load();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Rocket className="h-6 w-6 text-violet-500" /> Startaplar</h1>
          <p className="mt-1 text-sm text-slate-500">O'zbekistondagi eng yaxshi startaplar</p>
        </div>
        <Link href="/startups/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Yangi startap</Button></Link>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Startap qidirish..." className="pl-10" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <option value="trending">Trendagi</option>
            <option value="newest">Yangilari</option>
            <option value="popular">Mashhur</option>
            <option value="funding">Ko'p mablag'</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {STAGES.map(s => (
            <button key={s} onClick={() => setStage(s)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition', stage === s ? 'bg-violet-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-500/50 dark:border-slate-800 dark:bg-slate-900')}>
              {s === 'all' ? 'Barchasi' : s.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 8).map(c => (
            <button key={c} onClick={() => setCategory(c)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition', category === c ? 'bg-pink-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-pink-500/50 dark:border-slate-800 dark:bg-slate-900')}>
              {c === 'all' ? 'Barcha sohalar' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}
        </div>
      ) : startups.length === 0 ? (
        <div className="py-20 text-center">
          <Rocket className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="text-lg font-semibold">Startap topilmadi</h3>
          <p className="text-sm text-slate-500">Filterlarni o'zgartirib ko'ring</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {startups.map((s) => (
            <Link key={s.id} href={`/startups/${s.slug}`} className="group">
              <Card className="h-full overflow-hidden p-0 transition-all hover:shadow-xl">
                <div className="relative h-32 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500">
                  {s.coverImage && <img src={s.coverImage} alt={s.name} className="h-full w-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {s.isFeatured && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white"><Crown className="inline h-2.5 w-2.5" /> TOP</span>}
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-violet-500">{s.stage}</span>
                  </div>
                  <div className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white text-base font-bold text-violet-500 shadow-lg dark:border-slate-950">
                    {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full rounded-lg object-cover" /> : s.name?.[0]}
                  </div>
                </div>
                <div className="px-4 pb-4 pt-7">
                  <h3 className="truncate text-base font-bold group-hover:text-violet-500">{s.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.tagline || s.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.tags?.slice(0, 3).map((t: string) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">{t}</span>)}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 dark:border-slate-800">
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {formatNumber(s.viewsCount || 0)}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {formatNumber(s.likesCount || 0)}</span>
                    {s.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {s.location}</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
