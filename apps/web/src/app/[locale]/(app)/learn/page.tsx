'use client';
import { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award, Filter, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const COURSES = [
  { id: '1', title: 'JavaScript Asoslari', lessons: 24, duration: '4 soat', level: 'Boshlang\'ich', progress: 75, category: 'Dasturlash', emoji: '💻', color: 'from-yellow-500 to-orange-500' },
  { id: '2', title: 'React.js To\'liq Kurs', lessons: 36, duration: '8 soat', level: 'O\'rta', progress: 40, category: 'Dasturlash', emoji: '⚛️', color: 'from-cyan-500 to-blue-500' },
  { id: '3', title: 'Ingliz Tili A1', lessons: 50, duration: '20 soat', level: 'Boshlang\'ich', progress: 100, category: 'Tillar', emoji: '🇬🇧', color: 'from-red-500 to-pink-500' },
  { id: '4', title: 'UI/UX Dizayn', lessons: 28, duration: '6 soat', level: 'O\'rta', progress: 20, category: 'Dizayn', emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: '5', title: 'Moliyaviy Savodxonlik', lessons: 18, duration: '3 soat', level: 'Boshlang\'ich', progress: 0, category: 'Biznes', emoji: '💰', color: 'from-green-500 to-emerald-500' },
  { id: '6', title: 'Python Dasturlash', lessons: 40, duration: '10 soat', level: 'Boshlang\'ich', progress: 60, category: 'Dasturlash', emoji: '🐍', color: 'from-blue-500 to-indigo-500' },
  { id: '7', title: 'Marketing Asoslari', lessons: 22, duration: '5 soat', level: 'Boshlang\'ich', progress: 0, category: 'Biznes', emoji: '📈', color: 'from-amber-500 to-yellow-500' },
  { id: '8', title: 'Fotografiya', lessons: 15, duration: '4 soat', level: 'O\'rta', progress: 100, category: 'San\'at', emoji: '📷', color: 'from-pink-500 to-rose-500' },
  { id: '9', title: 'Rus Tili', lessons: 45, duration: '15 soat', level: 'O\'rta', progress: 30, category: 'Tillar', emoji: '🇷🇺', color: 'from-blue-600 to-red-500' },
];

const CATEGORIES = ['Hammasi', 'Dasturlash', 'Tillar', 'Dizayn', 'Biznes', 'San\'at'];

export default function LearnPage() {
  const [category, setCategory] = useState('Hammasi');
  const filtered = COURSES.filter((c) => category === 'Hammasi' || c.category === category);
  const inProgress = COURSES.filter((c) => c.progress > 0 && c.progress < 100);
  const completed = COURSES.filter((c) => c.progress === 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">O\'rganish</h1>
        <p className="mt-1 text-text-muted">Yangi ko\'nikmalar o\'rganing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><BookOpen className="mx-auto h-8 w-8 text-blue-500" /><p className="mt-2 text-2xl font-bold">{inProgress.length}</p><p className="text-xs text-text-muted">faol kurs</p></Card>
        <Card className="text-center"><CheckCircle className="mx-auto h-8 w-8 text-green-500" /><p className="mt-2 text-2xl font-bold">{completed.length}</p><p className="text-xs text-text-muted">tugatilgan</p></Card>
        <Card className="text-center"><Award className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 text-2xl font-bold">12</p><p className="text-xs text-text-muted">sertifikat</p></Card>
      </div>

      {/* In progress */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Davom ettirish</h2>
          <div className="space-y-3">
            {inProgress.slice(0, 2).map((c) => (
              <Card key={c.id} className="flex items-center gap-4">
                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl text-white shadow-lg', c.color)}>
                  {c.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-xs text-text-muted">{c.lessons} dars · {c.duration}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={c.progress} className="flex-1" />
                    <span className="text-xs font-semibold">{c.progress}%</span>
                  </div>
                </div>
                <Button size="sm"><Play className="h-3.5 w-3.5" /></Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      {/* All courses */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Barcha kurslar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
              <div className={cn('flex h-32 items-center justify-center bg-gradient-to-br text-6xl', c.color)}>{c.emoji}</div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">{c.level}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>
                </div>
                <h3 className="mt-2 font-semibold">{c.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{c.lessons} ta dars</p>
                {c.progress > 0 ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={c.progress} className="flex-1" />
                    <span className="text-xs font-semibold">{c.progress}%</span>
                  </div>
                ) : (
                  <Button size="sm" className="mt-3 w-full">Boshlash</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
