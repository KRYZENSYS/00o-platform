'use client';
import { useState } from 'react';
import { ArrowLeft, Heart, Share2, Clock, Users, Flame, ChefHat, Bookmark, Play, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const INGREDIENTS = [
  { name: 'Go\'sht (mol)', amount: 500, unit: 'g' },
  { name: 'Guruch', amount: 400, unit: 'g' },
  { name: 'Piyoz', amount: 2, unit: ' dona' },
  { name: 'Sabzi', amount: 3, unit: ' dona' },
  { name: 'Sariyog\'', amount: 100, unit: 'g' },
  { name: 'Ziravorlar', amount: 1, unit: ' osh qoshiq' },
  { name: 'Tuz', amount: 1, unit: ' choy qoshiq' },
  { name: 'Suv', amount: 800, unit: 'ml' },
];

const STEPS = [
  { step: 1, title: 'Go\'shtni tayyorlang', desc: 'Go\'shtni kubik shaklida to\'g\'rang va qizdirilgan qozonda qovuring 5 daqiqa.', time: '5 daqiqa' },
  { step: 2, title: 'Sabzavotlarni qo\'shing', desc: 'Piyoz va sabzini mayda to\'g\'rab, go\'shtga qo\'shing va 3 daqiqa qovuring.', time: '3 daqiqa' },
  { step: 3, title: 'Ziravorlarni qo\'shing', desc: 'Tuz, murch va ziravorlarni qo\'shing, 1 daqiqa aralashtiring.', time: '1 daqiqa' },
  { step: 4, title: 'Guruch va suv', desc: 'Yuvilgan guruch va issiq suvni qo\'shing. Qopqog\'ini yoping.', time: '2 daqiqa' },
  { step: 5, title: 'Pishirish', desc: 'Kichik olovda 30-40 daqiqa pishiring. Aralashtirmang!', time: '40 daqiqa' },
  { step: 6, title: 'Tayyor!', desc: 'Palovni yaxshilab aralashtiring va issiq holda torting.', time: '5 daqiqa' },
];

export default function RecipeDetailPage() {
  const [servings, setServings] = useState(6);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleStep = (n: number) => {
    const c = new Set(completed);
    c.has(n) ? c.delete(n) : c.add(n);
    setCompleted(c);
  };

  return (
    <div className="space-y-6">
      <Link href="/recipes" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" /> Orqaga
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-9xl">
              🍚
              <button className="absolute right-3 top-3 rounded-full bg-white/80 p-2 backdrop-blur"><Heart className="h-4 w-4 fill-red-500 text-red-500" /></button>
              <button className="absolute right-14 top-3 rounded-full bg-white/80 p-2 backdrop-blur"><Share2 className="h-4 w-4" /></button>
              <button className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg"><Play className="h-5 w-5 fill-current" /></button>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold">O'zbek Palovi</h1>
              <p className="mt-2 text-text-muted">An\'anaviy o\'zbek palovi - bayramona taom</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 60 daqiqa</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {servings} kishi</span>
                <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> 450 kkal</span>
                <span className="flex items-center gap-1"><ChefHat className="h-4 w-4" /> O\'rta</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold">Tayyorlash bosqichlari</h2>
            <div className="space-y-3">
              {STEPS.map((s) => (
                <button
                  key={s.step}
                  onClick={() => toggleStep(s.step)}
                  className={cn('flex w-full gap-3 rounded-xl border p-4 text-left transition-all', completed.has(s.step) ? 'border-green-500/30 bg-green-500/5' : 'border-border hover:bg-surface-2')}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold', completed.has(s.step) ? 'bg-green-500 text-white' : 'bg-brand-500/10 text-brand-500')}>
                    {completed.has(s.step) ? '✓' : s.step}
                  </div>
                  <div className="flex-1">
                    <h3 className={cn('font-semibold', completed.has(s.step) && 'line-through text-text-muted')}>{s.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">{s.desc}</p>
                    <span className="mt-2 inline-block text-xs text-text-muted">⏱ {s.time}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-bold">Masalliq</h2>
            <div className="mb-3 flex items-center justify-between rounded-xl bg-surface-2 p-2">
              <span className="text-sm">Porsiya:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3"><Minus className="h-3 w-3" /></button>
                <span className="w-8 text-center font-semibold">{servings}</span>
                <button onClick={() => setServings(servings + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="space-y-2">
              {INGREDIENTS.map((i) => {
                const adjusted = (i.amount * servings) / 6;
                return (
                  <label key={i.name} className="flex items-center gap-2 rounded-lg p-2 hover:bg-surface-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    <span className="flex-1 text-sm">{i.name}</span>
                    <span className="text-sm font-semibold">{Math.round(adjusted)} {i.unit}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-bold">Maslahatlar</h2>
            <ul className="space-y-2 text-sm">
              <li>🔥 Guruchni oldindan yuvib, 30 daqiqa suvga solib qo\'ying</li>
              <li>🧂 Ziravorlarni o\'lchab soling</li>
              <li>⏱ Vaqtni aniq saqlang</li>
              <li>🎨 Bezash uchun yashil piyoz ishlating</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
