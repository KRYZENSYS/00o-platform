'use client';
import { useState } from 'react';
import { Bookmark, Plus, Tag, Search, ExternalLink, Folder, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Bookmark { id: string; title: string; url: string; description?: string; tags: string[]; folder: string; favorite: boolean; }

const FOLDERS = ['Hammasi', 'Dasturlash', 'Dizayn', 'Maqolalar', 'Vositalar', 'Ijtimoiy'];
const SAMPLE: Bookmark[] = [
  { id: '1', title: 'React Documentation', url: 'https://react.dev', description: 'Rasmiy React hujjatlari', tags: ['react', 'docs'], folder: 'Dasturlash', favorite: true },
  { id: '2', title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: 'Utility-first CSS framework', tags: ['css', 'framework'], folder: 'Dasturlash', favorite: true },
  { id: '3', title: 'Dribbble', url: 'https://dribbble.com', description: 'Dizayn ilhomlanish', tags: ['dizayn'], folder: 'Dizayn', favorite: false },
  { id: '4', title: 'Habr', url: 'https://habr.com', description: 'IT maqolalar', tags: ['maqola'], folder: 'Maqolalar', favorite: false },
  { id: '5', title: 'Figma', url: 'https://figma.com', tags: ['dizayn', 'tool'], folder: 'Vositalar', favorite: true },
  { id: '6', title: 'GitHub', url: 'https://github.com', tags: ['code'], folder: 'Dasturlash', favorite: false },
];

export default function BookmarksPage() {
  const [folder, setFolder] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const filtered = SAMPLE.filter((b) => (folder === 'Hammasi' || b.folder === folder) && (!search || b.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Xatcho\'plar</h1>
        <Button><Plus className="h-4 w-4" /> Yangi</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {FOLDERS.map((f) => (
          <button key={f} onClick={() => setFolder(f)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', folder === f ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {f === 'Hammasi' ? '📁 ' : '📂 '}{f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <Card key={b.id} className="group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="truncate font-semibold">{b.title}</h3>
                  {b.favorite && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                </div>
                <p className="truncate text-xs text-brand-500">{b.url}</p>
                {b.description && <p className="mt-1 line-clamp-2 text-sm text-text-muted">{b.description}</p>}
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.tags.map((t) => <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">#{t}</span>)}
                </div>
              </div>
              <a href={b.url} target="_blank" rel="noopener" className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-surface-2 group-hover:opacity-100">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <Folder className="h-3 w-3" />{b.folder}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
