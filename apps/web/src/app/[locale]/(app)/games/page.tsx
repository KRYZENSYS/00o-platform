'use client';
import { useState } from 'react';
import { Play, Trophy, Star, Users, Clock, Zap, Brain, Puzzle, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GAMES = [
  { id: '1', name: '2048', emoji: '🎮', category: 'Puzzle', players: 12450, rating: 4.7, color: 'from-amber-500 to-orange-500', desc: 'Raqamlarni birlashtiring!' },
  { id: '2', name: 'Sudoku', emoji: '🔢', category: 'Mantiq', players: 8920, rating: 4.8, color: 'from-blue-500 to-cyan-500', desc: '9x9 jadval jumboq' },
  { id: '3', name: 'Tic Tac Toe', emoji: '⭕', category: 'Strategiya', players: 15670, rating: 4.5, color: 'from-pink-500 to-rose-500', desc: '3 ta bir qatorda' },
  { id: '4', name: 'Memory Match', emoji: '🧠', category: 'Xotira', players: 6780, rating: 4.6, color: 'from-violet-500 to-purple-500', desc: 'Juftliklarni toping' },
  { id: '5', name: 'Snake', emoji: '🐍', category: 'Arkada', players: 23450, rating: 4.9, color: 'from-green-500 to-emerald-500', desc: 'Klassik ilon o\'yini' },
  { id: '6', name: 'Chess', emoji: '♟️', category: 'Strategiya', players: 4560, rating: 4.8, color: 'from-slate-600 to-slate-800', desc: 'Shaxmat donoligi' },
  { id: '7', name: 'Quiz', emoji: '❓', category: 'Bilim', players: 18230, rating: 4.7, color: 'from-yellow-500 to-amber-500', desc: 'Savollar-javoblar' },
  { id: '8', name: 'Math Rush', emoji: '➕', category: 'Mantiq', players: 9870, rating: 4.6, color: 'from-red-500 to-pink-500', desc: 'Tez matematik' },
  { id: '9', name: 'Color Match', emoji: '🎨', category: 'Puzzle', players: 7650, rating: 4.5, color: 'from-fuchsia-500 to-pink-500', desc: 'Ranglar uyg\'unligi' },
  { id: '10', name: 'Reaction', emoji: '⚡', category: 'Arkada', players: 11240, rating: 4.4, color: 'from-indigo-500 to-violet-500', desc: 'Tezlik sinovi' },
  { id: '11', name: 'Word Search', emoji: '📝', category: 'Bilim', players: 5430, rating: 4.5, color: 'from-teal-500 to-cyan-500', desc: 'So\'zlarni top' },
  { id: '12', name: 'Minesweeper', emoji: '💣', category: 'Strategiya', players: 8920, rating: 4.6, color: 'from-gray-500 to-gray-700', desc: 'Minalardan qoch' },
];

const CATEGORIES = ['Hammasi', 'Puzzle', 'Mantiq', 'Strategiya', 'Arkada', 'Xotira', 'Bilim'];

export default function GamesPage() {
  const [category, setCategory] = useState('Hammasi');
  const filtered = GAMES.filter((g) => category === 'Hammasi' || g.category === category);
  const featured = GAMES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">O\'yinlar</h1>
        <p className="mt-1 text-text-muted">O\'yna, o\'rgan, g\'olib bo\'l</p>
      </div>

      {/* Featured game */}
      <Card className={cn('overflow-hidden bg-gradient-to-br p-8 text-white', featured.color)}>
        <div className="flex items-center gap-6">
          <div className="text-8xl">{featured.emoji}</div>
          <div className="flex-1">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">Featured</span>
            <h2 className="mt-2 text-3xl font-bold">{featured.name}</h2>
            <p className="mt-1 text-white/90">{featured.desc}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-current" /> {featured.rating}</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {featured.players.toLocaleString()}</span>
            </div>
            <Button className="mt-4 bg-white text-slate-900 hover:bg-white/90" size="lg">
              <Play className="h-4 w-4" /> O\'ynash
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center"><Trophy className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 text-xl font-bold">42</p><p className="text-xs text-text-muted">g\'alaba</p></Card>
        <Card className="text-center"><Zap className="mx-auto h-8 w-8 text-yellow-500" /><p className="mt-2 text-xl font-bold">1250</p><p className="text-xs text-text-muted">XP</p></Card>
        <Card className="text-center"><Target className="mx-auto h-8 w-8 text-green-500" /><p className="mt-2 text-xl font-bold">87%</p><p className="text-xs text-text-muted">aniqlik</p></Card>
        <Card className="text-center"><Clock className="mx-auto h-8 w-8 text-blue-500" /><p className="mt-2 text-xl font-bold">8s</p><p className="text-xs text-text-muted">o\'rtacha</p></Card>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g) => (
          <Card key={g.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('flex aspect-square items-center justify-center bg-gradient-to-br text-7xl', g.color)}>{g.emoji}</div>
            <div className="p-3">
              <h3 className="font-semibold">{g.name}</h3>
              <p className="text-xs text-text-muted">{g.category}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{g.rating}</span>
                <span className="flex items-center gap-1 text-text-muted"><Users className="h-3 w-3" />{g.players >= 1000 ? `${(g.players / 1000).toFixed(1)}k` : g.players}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
