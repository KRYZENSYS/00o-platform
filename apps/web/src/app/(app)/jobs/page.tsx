'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, MapPin, Briefcase, Clock, DollarSign, Filter, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const TYPES = ['all', 'full-time', 'part-time', 'contract', 'internship', 'remote'] as const;
const TYPE_LABELS: Record<string, string> = { all: 'Hammasi', 'full-time': 'To\'liq', 'part-time': 'Yarim', contract: 'Shartnoma', internship: 'Amaliyot', remote: 'Masofadan' };

export default function JobsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>('all');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.jobs.list({ type: type === 'all' ? undefined : type, q: q || undefined });
      const d = r.data || {};
      setItems(d.items || d.results || d || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [type]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Ish o\'rinlari</h1>
          <p className="text-sm text-slate-500">Startaplar va kompaniyalardagi vakansiyalar</p>
        </div>
        <Link href="/jobs/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Vakansiya</Button></Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Lavozim, kompaniya..." className="pl-10" />
        </div>
        <Button onClick={load} variant="outline"><Filter className="h-4 w-4" /></Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${type === t ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}`}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-20 rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>)}</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Users className="h-12 w-12 text-slate-300" />
          <h3 className="font-bold">Vakansiya topilmadi</h3>
          <p className="text-sm text-slate-500">Birinchi vakansiya qo\'shing!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((j: any) => (
            <Link key={j.id} href={`/jobs/${j.id}`}>
              <Card className="transition hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <Building className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{j.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {j.company || j.startup?.name}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {j.location || 'Toshkent'}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {TYPE_LABELS[j.type] || j.type}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{j.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {j.salary_from && <div className="text-sm font-bold text-green-500">${j.salary_from}–${j.salary_to}</div>}
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">{TYPE_LABELS[j.type] || j.type}</span>
                    </div>
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
