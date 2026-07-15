'use client';
import { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Search, Plus, Star, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Contact { id: string; name: string; phone: string; email?: string; avatar?: string; favorite: boolean; tags: string[]; }

const CONTACTS: Contact[] = [
  { id: '1', name: 'Aziz Karimov', phone: '+998 90 123-45-67', email: 'aziz@mail.com', favorite: true, tags: ['ish', 'do\'st'] },
  { id: '2', name: 'Malika Yusupova', phone: '+998 91 234-56-78', email: 'malika@mail.com', favorite: true, tags: ['oilа'] },
  { id: '3', name: 'Bobur Ergashev', phone: '+998 93 345-67-89', favorite: false, tags: ['ish'] },
  { id: '4', name: 'Nilufar Saidova', phone: '+998 94 456-78-90', email: 'nilufar@mail.com', favorite: false, tags: ['do\'st'] },
  { id: '5', name: 'Sherzod Toshmatov', phone: '+998 95 567-89-01', favorite: true, tags: ['do\'st', 'sport'] },
  { id: '6', name: 'Dilfuza Mahmudova', phone: '+998 97 678-90-12', favorite: false, tags: ['oilа'] },
  { id: '7', name: 'Jasur Abdullayev', phone: '+998 99 789-01-23', favorite: false, tags: ['ish'] },
  { id: '8', name: 'Madina Qodirova', phone: '+998 88 890-12-34', email: 'madina@mail.com', favorite: false, tags: ['do\'st'] },
];

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'fav' | 'ish' | 'do\'st' | 'oilа'>('all');

  const filtered = CONTACTS.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchFilter = filter === 'all' || filter === 'fav' ? (filter === 'fav' ? c.favorite : true) : c.tags.includes(filter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kontaktlar</h1>
        <Button><Plus className="h-4 w-4" /> Yangi</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Hammasi' },
          { id: 'fav', label: '⭐ Sevimlilar' },
          { id: 'ish', label: '💼 Ish' },
          { id: 'do\'st', label: '👥 Do\'stlar' },
          { id: 'oilа', label: '👨‍👩‍👧 Oila' },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id as any)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', filter === f.id ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="group">
            <div className="flex items-start gap-3">
              <Avatar name={c.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  {c.favorite && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                </div>
                <p className="truncate text-sm text-text-muted">{c.phone}</p>
                {c.email && <p className="truncate text-xs text-text-muted">{c.email}</p>}
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.tags.map((t) => <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{t}</span>)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Button size="sm" variant="outline" className="flex-1"><Phone className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" className="flex-1"><MessageCircle className="h-3.5 w-3.5" /></Button>
              {c.email && <Button size="sm" variant="outline" className="flex-1"><Mail className="h-3.5 w-3.5" /></Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
