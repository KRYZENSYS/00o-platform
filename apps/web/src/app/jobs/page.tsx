'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Plus, MapPin, DollarSign, Clock, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { formatNumber, cn } from '@/lib/utils';

const TYPES = ['all', 'full-time', 'part-time', 'contract', 'internship', 'freelance'];
const MODES = ['all', 'remote', 'on-site', 'hybrid'];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [mode, setMode] = useState('all');

  useEffect(() => { load(); }, [type, mode]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.list({
        q: q || undefined,
        jobType: type === 'all' ? undefined : type,
        workMode: mode === 'all' ? undefined : mode,
        limit: 30,
      });
      setJobs(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Briefcase className="h-6 w-6 text-violet-500" /> Ish o'rinlari</h1>
          <p className="mt-1 text-sm text-slate-500">Startaplarda eng yaxshi imkoniyatlar</p>
        </div>
        <Link href="/jobs/new"><Button variant="gradient"><Plus className="h-4 w-4" /> Vakansiya qo'shish</Button></Link>
      </div>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Lavozim, kompaniya, ko'nikma..." className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition', type === t ? 'bg-violet-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-violet-500/50 dark:border-slate-800 dark:bg-slate-900')}>
              {t === 'all' ? 'Barchasi' : t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition', mode === m ? 'bg-pink-500 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-pink-500/50 dark:border-slate-800 dark:bg-slate-900')}>
              {m === 'all' ? 'Barcha format' : m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <Briefcase className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="text-lg font-semibold">Vakansiyalar topilmadi</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`}>
              <Card className="group p-4 transition-all hover:border-violet-500/50 hover:shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold group-hover:text-violet-500">{j.title}</h3>
                      {j.isUrgent && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">🔥 Shoshilinch</span>}
                      {j.isFeatured && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">⭐ TOP</span>}
                    </div>
                    <p className="line-clamp-1 text-sm text-slate-600 dark:text-slate-400">
                      {j.company && <span className="font-semibold">{j.company}</span>}
                      {j.location && <> • <MapPin className="inline h-3 w-3" /> {j.location}</>}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-500">{j.jobType}</span>
                      <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-pink-500">{j.workMode}</span>
                      <span>{j.experienceLevel}</span>
                      {j.skills?.slice(0, 3).map((s: string) => <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{s}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    {(j.salaryMin || j.salaryMax) && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-500">Maosh</div>
                        <div className="text-base font-bold text-violet-500">
                          {j.salaryMin ? formatNumber(j.salaryMin) : ''} {j.salaryMax ? ` - ${formatNumber(j.salaryMax)}` : ''}
                          <span className="ml-1 text-xs text-slate-500">{j.currency}</span>
                        </div>
                      </div>
                    )}
                    <Button size="sm" variant="gradient">Apply</Button>
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
