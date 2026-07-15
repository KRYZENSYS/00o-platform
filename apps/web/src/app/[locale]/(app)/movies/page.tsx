'use client';
import { useState } from 'react';
import { Play, Star, Heart, Plus, Search, Filter, Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MOVIES = [
  { id: '1', title: 'Qasoskorlar: Final', year: 2024, rating: 8.9, genre: 'Action', duration: 180, emoji: '🦸', color: 'from-red-500 to-orange-600', desc: 'Marvel dunyosi yakuniga yetadi' },
  { id: '2', title: 'Yulduzli osmon', year: 2024, rating: 7.5, genre: 'Drama', duration: 130, emoji: '🌌', color: 'from-blue-500 to-indigo-700', desc: 'Bir oilaning hayot hikoyasi' },
  { id: '3', title: 'Komedi kechasi', year: 2023, rating: 8.1, genre: 'Komediya', duration: 105, emoji: '😂', color: 'from-yellow-400 to-amber-500', desc: 'Oilaviy komediya' },
  { id: '4', title: 'Sirli o\'rmon', year: 2024, rating: 8.7, genre: 'Sarguzasht', duration: 145, emoji: '🌲', color: 'from-green-500 to-emerald-700', desc: 'Sehrli o\'rmon sirlari' },
  { id: '5', title: 'Yurak ovozi', year: 2023, rating: 9.0, genre: 'Romantika', duration: 120, emoji: '❤️', color: 'from-pink-500 to-rose-600', desc: 'Sevgi hikoyasi' },
  { id: '6', title: 'Jangchi', year: 2024, rating: 8.3, genre: 'Action', duration: 155, emoji: '🥋', color: 'from-orange-500 to-red-600', desc: 'Sport jangi haqida' },
  { id: '7', title: 'Kelajak', year: 2025, rating: 8.8, genre: 'Fantastika', duration: 165, emoji: '🚀', color: 'from-violet-500 to-purple-700', desc: 'Koinot sirlari' },
  { id: '8', title: 'Tarix guvohi', year: 2023, rating: 7.9, genre: 'Tarix', duration: 140, emoji: '📜', color: 'from-amber-600 to-yellow-700', desc: 'Tarixiy voqealar' },
  { id: '9', title: 'Qo\'rqinchli tun', year: 2024, rating: 7.2, genre: 'Horror', duration: 110, emoji: '👻', color: 'from-gray-700 to-slate-900', desc: 'Qo\'rqinchli hikoya' },
];

const GENRES = ['Hammasi', 'Action', 'Drama', 'Komediya', 'Sarguzasht', 'Romantika', 'Fantastika', 'Tarix', 'Horror'];

export default function MoviesPage() {
  const [genre, setGenre] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['5', '7']));

  const filtered = MOVIES.filter((m) => (genre === 'Hammasi' || m.genre === genre) && (!search || m.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kinolar</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Kino qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', genre === g ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m) => (
          <Card key={m.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('relative flex aspect-[2/3] items-center justify-center bg-gradient-to-br text-8xl', m.color)}>
              {m.emoji}
              <button onClick={() => { const f = new Set(favorites); f.has(m.id) ? f.delete(m.id) : f.add(m.id); setFavorites(f); }} className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 backdrop-blur">
                <Heart className={cn('h-4 w-4', favorites.has(m.id) ? 'fill-red-500 text-red-500' : 'text-white')} />
              </button>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{m.rating}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900"><Play className="h-6 w-6 fill-current" /></div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-semibold">{m.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.year}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.duration}min</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
