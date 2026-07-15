'use client';
import { useState } from 'react';
import { Activity, Flame, Clock, TrendingUp, Plus, Heart, Zap, Target, Award, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const WORKOUTS = [
  { id: '1', name: 'Yugurish', type: 'Kardio', duration: 30, calories: 350, emoji: '🏃', color: 'from-orange-500 to-red-500' },
  { id: '2', name: 'Shtanga ko\'tarish', type: 'Kuch', duration: 45, calories: 280, emoji: '💪', color: 'from-purple-500 to-violet-600' },
  { id: '3', name: 'Yoga', type: 'Flexibility', duration: 60, calories: 180, emoji: '🧘', color: 'from-emerald-500 to-teal-600' },
  { id: '4', name: 'Velosiped', type: 'Kardio', duration: 45, calories: 400, emoji: '🚴', color: 'from-cyan-500 to-blue-600' },
  { id: '5', name: 'Suzish', type: 'Kardio', duration: 30, calories: 320, emoji: '🏊', color: 'from-blue-500 to-indigo-600' },
  { id: '6', name: 'Push-up', type: 'Kuch', duration: 15, calories: 120, emoji: '🤸', color: 'from-pink-500 to-rose-600' },
  { id: '7', name: 'Pilates', type: 'Flexibility', duration: 50, calories: 200, emoji: '💃', color: 'from-rose-500 to-pink-600' },
  { id: '8', name: 'Boks', type: 'Kuch', duration: 60, calories: 500, emoji: '🥊', color: 'from-red-500 to-orange-600' },
];

const TYPES = ['Hammasi', 'Kardio', 'Kuch', 'Flexibility'];

export default function WorkoutPage() {
  const [type, setType] = useState('Hammasi');
  const filtered = WORKOUTS.filter((w) => type === 'Hammasi' || w.type === type);
  const totalCal = WORKOUTS.reduce((s, w) => s + w.calories, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sport mashg\'ulotlari</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="text-center"><Flame className="mx-auto h-8 w-8 text-orange-500" /><p className="mt-2 text-2xl font-bold">{totalCal}</p><p className="text-xs text-text-muted">kkal</p></Card>
        <Card className="text-center"><Clock className="mx-auto h-8 w-8 text-blue-500" /><p className="mt-2 text-2xl font-bold">5s 40m</p><p className="text-xs text-text-muted">vaqt</p></Card>
        <Card className="text-center"><Target className="mx-auto h-8 w-8 text-green-500" /><p className="mt-2 text-2xl font-bold">{WORKOUTS.length}</p><p className="text-xs text-text-muted">mashg\'ulot</p></Card>
        <Card className="text-center"><Award className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 text-2xl font-bold">7</p><p className="text-xs text-text-muted">kun streak</p></Card>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setType(t)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', type === t ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((w) => (
          <Card key={w.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('flex aspect-square items-center justify-center bg-gradient-to-br text-7xl', w.color)}>{w.emoji}</div>
            <div className="p-3">
              <h3 className="font-semibold">{w.name}</h3>
              <p className="text-xs text-text-muted">{w.type}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.duration}min</span>
                <span className="flex items-center gap-1 text-orange-500"><Flame className="h-3 w-3" />{w.calories}kkal</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
