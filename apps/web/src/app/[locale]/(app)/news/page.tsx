'use client';
import { useState } from 'react';
import { Newspaper, TrendingUp, Clock, Heart, Share2, Bookmark, ExternalLink, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, timeAgo } from '@/lib/utils';

const NEWS = [
  { id: '1', title: 'Toshkentda yangi texnopark ochildi', category: 'Texnologiya', source: 'Kun.uz', time: '2 soat oldin', emoji: '🚀', color: 'from-blue-500 to-cyan-500', read: 12500, likes: 234 },
  { id: '2', title: 'O\'zbekiston Markaziy Osiyo yetakchisiga aylandi', category: 'Iqtisodiyot', source: 'Daryo.uz', time: '5 soat oldin', emoji: '📈', color: 'from-green-500 to-emerald-600', read: 8900, likes: 178 },
  { id: '3', title: 'Yangi AI texnologiyalar taqdimoti', category: 'Texnologiya', source: 'IT Park', time: '7 soat oldin', emoji: '🤖', color: 'from-violet-500 to-purple-600', read: 6700, likes: 145 },
  { id: '4', title: 'Madaniyat festivali boshlandi', category: 'Madaniyat', source: 'UzReport', time: '1 kun oldin', emoji: '🎭', color: 'from-pink-500 to-rose-600', read: 4500, likes: 98 },
  { id: '5', title: 'Sport yangiliklari: futbol g\'alabasi', category: 'Sport', source: 'Stadion.uz', time: '1 kun oldin', emoji: '⚽', color: 'from-orange-500 to-red-600', read: 9800, likes: 234 },
  { id: '6', title: 'Ilm-fan yangiliklari', category: 'Fan', source: 'ZiyoNET', time: '2 kun oldin', emoji: '🔬', color: 'from-indigo-500 to-blue-600', read: 3400, likes: 67 },
];

const CATEGORIES = ['Hammasi', 'Texnologiya', 'Iqtisodiyot', 'Madaniyat', 'Sport', 'Fan', 'Siyosat'];

export default function NewsPage() {
  const [category, setCategory] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const filtered = NEWS.filter((n) => (category === 'Hammasi' || n.category === category) && (!search || n.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yangiliklar</h1>
        <p className="mt-1 text-sm text-text-muted">Eng so\'nggi yangiliklar O\'zbekistonda</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Yangilik qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {NEWS[0] && (
        <Card className={cn('overflow-hidden p-0')}>
          <div className={cn('relative h-48 flex items-center justify-center bg-gradient-to-br text-8xl', NEWS[0].color)}>
            {NEWS[0].emoji}
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">LIVE</span>
          </div>
          <div className="p-4">
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs text-brand-500">{NEWS[0].category}</span>
            <h2 className="mt-2 text-xl font-bold">{NEWS[0].title}</h2>
            <p className="mt-2 text-sm text-text-muted">{NEWS[0].source} · {NEWS[0].time}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-text-muted">👁 {NEWS[0].read.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-text-muted">❤️ {NEWS[0].likes}</span>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(1).map((n) => (
          <Card key={n.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('flex h-32 items-center justify-center bg-gradient-to-br text-6xl', n.color)}>
              {n.emoji}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-brand-500">{n.category}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-muted">{n.source}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 font-semibold">{n.title}</h3>
              <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{n.time}</span>
                <div className="flex items-center gap-2">
                  <button><Heart className="h-3 w-3" /></button>
                  <button><Bookmark className="h-3 w-3" /></button>
                  <button><Share2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
