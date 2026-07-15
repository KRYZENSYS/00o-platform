'use client';
import { useState } from 'react';
import { Plus, MoreVertical, Calendar, User, Tag, Filter, Search, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Task { id: string; title: string; description?: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; assignee?: string; tags: string[]; }

const INITIAL_COLUMNS = {
  todo: { name: 'Rejada', color: 'bg-slate-500', tasks: [
    { id: '1', title: 'Loyiha rejasini tuzish', description: 'Yangi loyiha uchun', priority: 'HIGH' as const, tags: ['reja'], assignee: 'AK' },
    { id: '2', title: 'Dizayn yaratish', priority: 'MEDIUM' as const, tags: ['dizayn'], assignee: 'MY' },
    { id: '3', title: 'API hujjatlari', priority: 'LOW' as const, tags: ['docs'], assignee: 'BE' },
  ]},
  progress: { name: 'Jarayonda', color: 'bg-blue-500', tasks: [
    { id: '4', title: 'Backend API yozish', description: 'Auth, users, posts', priority: 'URGENT' as const, tags: ['backend', 'api'], assignee: 'JS' },
    { id: '5', title: 'Frontend komponentlar', priority: 'HIGH' as const, tags: ['frontend'], assignee: 'NK' },
  ]},
  review: { name: 'Tekshiruvda', color: 'bg-amber-500', tasks: [
    { id: '6', title: 'UI dizayn review', priority: 'MEDIUM' as const, tags: ['design'], assignee: 'DT' },
  ]},
  done: { name: 'Bajarildi', color: 'bg-green-500', tasks: [
    { id: '7', title: 'Database sxema', priority: 'HIGH' as const, tags: ['db'], assignee: 'AK' },
    { id: '8', title: 'Login page', priority: 'MEDIUM' as const, tags: ['auth'], assignee: 'MY' },
  ]},
};

const PRIORITY_COLORS = { LOW: 'bg-slate-500/20 text-slate-500', MEDIUM: 'bg-blue-500/20 text-blue-500', HIGH: 'bg-orange-500/20 text-orange-500', URGENT: 'bg-red-500/20 text-red-500' };
const PRIORITY_LABELS = { LOW: 'Past', MEDIUM: 'O\'rta', HIGH: 'Yuqori', URGENT: 'Shoshilinch' };

export default function BoardPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loyiha doskasi</h1>
        <Button><Plus className="h-4 w-4" /> Yangi vazifa</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Vazifa qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(INITIAL_COLUMNS).map(([key, col]) => (
          <div key={key} className="flex flex-col rounded-2xl bg-surface-2/50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', col.color)} />
                <h3 className="text-sm font-semibold">{col.name}</h3>
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs">{col.tasks.length}</span>
              </div>
              <button className="rounded p-1 hover:bg-surface-3"><MoreVertical className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-2">
              {col.tasks.map((t) => (
                <Card key={t.id} className="cursor-grab p-3 text-sm active:cursor-grabbing">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{t.title}</p>
                    <button className="opacity-0 group-hover:opacity-100"><MoreVertical className="h-3 w-3" /></button>
                  </div>
                  {t.description && <p className="mt-1 text-xs text-text-muted">{t.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className={cn('rounded px-1.5 py-0.5 text-xs', PRIORITY_COLORS[t.priority])}>{PRIORITY_LABELS[t.priority]}</span>
                    {t.tags.map((tag) => <span key={tag} className="rounded bg-surface-3 px-1.5 py-0.5 text-xs">#{tag}</span>)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {t.assignee && <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-xs font-semibold text-white">{t.assignee}</div>}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />15 iyul</span>
                    </div>
                  </div>
                </Card>
              ))}
              <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2 text-xs text-text-muted hover:border-brand-500 hover:text-brand-500">
                <Plus className="h-3 w-3" /> Qo'shish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
