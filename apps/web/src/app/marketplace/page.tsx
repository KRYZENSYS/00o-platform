'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Plus, Star, Clock, Filter, Grid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { formatNumber, cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', i: '🎯', name: 'Barchasi' },
  { id: 'design', i: '🎨', name: 'Dizayn' },
  { id: 'development', i: '💻', name: 'Dasturlash' },
  { id: 'marketing', i: '📈', name: 'Marketing' },
  { id: 'writing', i: '✍️', name: 'Yozish' },
  { id: 'video', i: '🎬', name: 'Video' },
  { id: 'music', i: '🎵', name: 'Musiqa' },
  { id: 'business', i: '💼', name: 'Biznes' },
  { id: 'ai', i: '🤖', name: 'AI xizmatlari' },
  { id: 'data', i: '📊', name: 'Data' },
  { id: 'mobile', i: '📱', name: 'Mobile' },
  { id: 'consulting', i: '🎓', name: 'Konsultatsiya' },
];

export default function MarketplacePage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('popular');

  useEffect(() => { load(); }, [category, sort]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.marketplace.services({
        q: q || undefined,
        category: category === 'all' ? undefined : category,
        sort,
        limit: 30,
      });
      setServices(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Briefcase className="h-6 w-6 text-violet-500" /> Marketplace</h1>
          <p className="mt-1 text-sm text-slate-500">Professional xizmatlarni toping yoki o'z xizmatingizni taklif qiling</p>
        </div>
        <Link href="/marketplace/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Xizmat qo'shish</Button></Link>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Xizmat qidirish..." className="pl-10" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          <option value="popular">Mashhur</option>
          <option value="newest">Yangilari</option>
          <option value="price-low">Arzondan</option>
          <option value="price-high">Qimmatroq</option>
          <option value="rating">Eng yaxshi</option>
        </select>
        <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => setView('grid')} className={cn('rounded-lg p-1.5', view === 'grid' ? 'bg-violet-500 text-white' : 'text-slate-500')}><Grid className="h-4 w-4" /></button>
          <button onClick={() => setView('list')} className={cn('rounded-lg p-1.5', view === 'list' ? 'bg-violet-500 text-white' : 'text-slate-500')}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition', category === c.id ? 'bg-violet-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-500/50 dark:border-slate-800 dark:bg-slate-900')}>
            <span>{c.i}</span> {c.name}
          </button>
        ))}
      </div>

      {/* Services */}
      {loading ? (
        <div className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : '')}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="text-lg font-semibold">Xizmatlar topilmadi</h3>
          <p className="text-sm text-slate-500">Boshqa kategoriya tanlang</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => <ServiceRow key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ s }: { s: any }) {
  return (
    <Link href={`/marketplace/${s.id}`}>
      <Card className="group h-full p-0 transition-all hover:shadow-xl">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-violet-500/20 to-pink-500/20">
          {s.images?.[0] && <img src={s.images[0]} alt={s.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
          {s.isFeatured && <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">⭐ TOP</span>}
          {s.thumbnail && <img src={s.thumbnail} className="h-full w-full object-cover" />}
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-lg">{categoryIcon(s.category)}</span>
            <h3 className="line-clamp-1 text-sm font-bold group-hover:text-violet-500">{s.title}</h3>
          </div>
          <p className="line-clamp-2 text-xs text-slate-500">{s.description}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {s.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5 text-slate-500"><Clock className="h-3 w-3" /> {s.deliveryDays || 7} kun</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="text-xs">
              <div className="text-[10px] uppercase text-slate-500">Boshlanish narxi</div>
              <div className="text-base font-bold text-violet-500">{formatNumber(s.price)} {s.currency || 'UZS'}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500">Buyurtma</div>
              <div className="text-sm font-semibold">{s.ordersCount || 0}</div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ServiceRow({ s }: { s: any }) {
  return (
    <Link href={`/marketplace/${s.id}`}>
      <Card className="group p-0 transition-all hover:shadow-lg">
        <div className="flex gap-4 p-4">
          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {s.images?.[0] && <img src={s.images[0]} className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-1 text-base font-bold group-hover:text-violet-500">{s.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{s.description}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {s.rating?.toFixed(1) || '5.0'}</span>
              <span>{s.ordersCount || 0} buyurtma</span>
              <span className="text-violet-500 font-semibold">{formatNumber(s.price)} {s.currency || 'UZS'}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function categoryIcon(cat: string): string {
  const map: Record<string, string> = {
    design: '🎨', development: '💻', marketing: '📈', writing: '✍️', video: '🎬',
    music: '🎵', business: '💼', ai: '🤖', data: '📊', mobile: '📱', consulting: '🎓',
  };
  return map[cat] || '💼';
}
