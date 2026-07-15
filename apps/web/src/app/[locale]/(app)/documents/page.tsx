'use client';
import { useState } from 'react';
import { FileText, Plus, Search, Folder, Star, Trash2, Share2, MoreVertical, FileCode, FileImage, FileVideo } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Doc { id: string; title: string; type: 'doc' | 'code' | 'image' | 'video' | 'pdf'; size: string; updated: string; favorite: boolean; }

const DOCS: Doc[] = [
  { id: '1', title: 'Ish rejasi 2026', type: 'doc', size: '24 KB', updated: '2 soat oldin', favorite: true },
  { id: '2', title: 'Kod snippetlari', type: 'code', size: '12 KB', updated: 'Kecha', favorite: true },
  { id: '3', title: 'Dizayn mockup', type: 'image', size: '1.2 MB', updated: '3 kun oldin', favorite: false },
  { id: '4', title: 'Video dars', type: 'video', size: '45 MB', updated: '1 hafta oldin', favorite: false },
  { id: '5', title: 'PDF hisobot', type: 'pdf', size: '2.1 MB', updated: '2 hafta oldin', favorite: false },
  { id: '6', title: 'Yangi g\'oyalar', type: 'doc', size: '8 KB', updated: '3 hafta oldin', favorite: true },
];

const ICONS = { doc: FileText, code: FileCode, image: FileImage, video: FileVideo, pdf: FileText };
const COLORS = { doc: 'text-blue-500', code: 'text-emerald-500', image: 'text-pink-500', video: 'text-red-500', pdf: 'text-orange-500' };

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const filtered = DOCS.filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hujjatlar</h1>
        <Button><Plus className="h-4 w-4" /> Yangi</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 rounded-xl border border-border p-1">
          <button onClick={() => setView('grid')} className={cn('rounded-lg p-1.5 text-xs', view === 'grid' ? 'bg-brand-500 text-white' : '')}>Grid</button>
          <button onClick={() => setView('list')} className={cn('rounded-lg p-1.5 text-xs', view === 'list' ? 'bg-brand-500 text-white' : '')}>List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => {
          const Icon = ICONS[d.type];
          return (
            <Card key={d.id} className="group cursor-pointer transition-all hover:shadow-glow">
              <div className="flex items-start gap-3">
                <div className={cn('rounded-xl bg-surface-2 p-3', COLORS[d.type])}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate font-semibold">{d.title}</h3>
                    {d.favorite && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                  </div>
                  <p className="text-xs text-text-muted">{d.size} · {d.updated}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100"><MoreVertical className="h-4 w-4 text-text-muted" /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
