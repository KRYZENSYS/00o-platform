'use client';
import { useState } from 'react';
import { ChefHat, Clock, Users, Heart, Search, Filter, Flame, Bookmark, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Recipe { id: string; name: string; emoji: string; time: number; servings: number; difficulty: 'Oson' | 'O\'rta' | 'Qiyin'; category: string; calories: number; rating: number; favorite: boolean; color: string; }

const RECIPES: Recipe[] = [
  { id: '1', name: 'Palov', emoji: '🍚', time: 60, servings: 6, difficulty: 'O\'rta', category: 'Asosiy', calories: 450, rating: 4.9, favorite: true, color: 'from-amber-400 to-orange-500' },
  { id: '2', name: 'Manti', emoji: '🥟', time: 90, servings: 4, difficulty: 'Qiyin', category: 'Asosiy', calories: 380, rating: 4.8, favorite: true, color: 'from-yellow-500 to-red-500' },
  { id: '3', name: 'Lag\'mon', emoji: '🍜', time: 45, servings: 4, difficulty: 'O\'rta', category: 'Birinchi', calories: 320, rating: 4.7, favorite: false, color: 'from-orange-400 to-amber-600' },
  { id: '4', name: 'Somsa', emoji: '🥧', time: 50, servings: 8, difficulty: 'O\'rta', category: 'Pishiriq', calories: 280, rating: 4.9, favorite: true, color: 'from-amber-500 to-yellow-600' },
  { id: '5', name: 'Choy', emoji: '🍵', time: 10, servings: 1, difficulty: 'Oson', category: 'Ichimlik', calories: 5, rating: 4.6, favorite: false, color: 'from-green-500 to-emerald-600' },
  { id: '6', name: 'Mastava', emoji: '🍲', time: 40, servings: 5, difficulty: 'Oson', category: 'Birinchi', calories: 290, rating: 4.7, favorite: false, color: 'from-red-400 to-pink-500' },
  { id: '7', name: 'Shashlik', emoji: '🍢', time: 30, servings: 4, difficulty: 'Oson', category: 'Asosiy', calories: 420, rating: 4.9, favorite: true, color: 'from-red-500 to-orange-600' },
  { id: '8', name: 'Non', emoji: '🍞', time: 180, servings: 8, difficulty: 'Qiyin', category: 'Pishiriq', calories: 250, rating: 4.8, favorite: false, color: 'from-yellow-600 to-amber-700' },
  { id: '9', name: 'Salat', emoji: '🥗', time: 15, servings: 2, difficulty: 'Oson', category: 'Salat', calories: 120, rating: 4.5, favorite: false, color: 'from-green-400 to-lime-500' },
];

const CATEGORIES = ['Hammasi', 'Asosiy', 'Birinchi', 'Pishiriq', 'Ichimlik', 'Salat'];

export default function RecipesPage() {
  const [category, setCategory] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(RECIPES.filter(r => r.favorite).map(r => r.id)));

  const filtered = RECIPES.filter((r) => (category === 'Hammasi' || r.category === category) && (!search || r.name.toLowerCase().includes(search.toLowerCase())));

  const toggleFav = (id: string) => {
    const f = new Set(favorites);
    f.has(id) ? f.delete(id) : f.add(id);
    setFavorites(f);
    toast.success(f.has(id) ? 'Saqlandi' : 'O\'chirildi');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Retseptlar</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((r) => (
          <Card key={r.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('relative flex aspect-square items-center justify-center bg-gradient-to-br text-7xl', r.color)}>
              {r.emoji}
              <button onClick={() => toggleFav(r.id)} className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur transition-transform hover:scale-110">
                <Heart className={cn('h-4 w-4', favorites.has(r.id) ? 'fill-red-500 text-red-500' : 'text-text-muted')} />
              </button>
              <span className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-xs backdrop-blur">{r.difficulty}</span>
            </div>
            <div className="p-3">
              <h3 className="font-semibold">{r.name}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}min</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.servings}</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3" />{r.calories}kkal</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
