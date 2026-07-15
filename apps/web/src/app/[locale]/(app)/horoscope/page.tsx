'use client';
import { useState } from 'react';
import { Sparkles, Heart, Briefcase, Activity, DollarSign, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SIGNS = [
  { name: 'Qo\'y', emoji: '♈️', dates: '21.03 - 19.04', color: 'from-red-500 to-pink-500' },
  { name: 'Buqa', emoji: '♉️', dates: '20.04 - 20.05', color: 'from-green-500 to-emerald-600' },
  { name: 'Egizaklar', emoji: '♊️', dates: '21.05 - 20.06', color: 'from-yellow-500 to-amber-500' },
  { name: 'Qisqichbaqa', emoji: '♋️', dates: '21.06 - 22.07', color: 'from-slate-400 to-slate-600' },
  { name: 'Arslon', emoji: '♌️', dates: '23.07 - 22.08', color: 'from-orange-500 to-amber-600' },
  { name: 'Parizod', emoji: '♍️', dates: '23.08 - 22.09', color: 'from-emerald-600 to-teal-700' },
  { name: 'Tarozi', emoji: '♎️', dates: '23.09 - 22.10', color: 'from-pink-400 to-rose-500' },
  { name: 'Chayon', emoji: '♏️', dates: '23.10 - 21.11', color: 'from-purple-700 to-violet-800' },
  { name: 'O\'qotar', emoji: '♐️', dates: '22.11 - 21.12', color: 'from-blue-500 to-indigo-600' },
  { name: 'Tog\' echkisi', emoji: '♑️', dates: '22.12 - 19.01', color: 'from-stone-500 to-slate-700' },
  { name: 'Qovg\'a', emoji: '♒️', dates: '20.01 - 18.02', color: 'from-cyan-500 to-blue-600' },
  { name: 'Baliq', emoji: '♓️', dates: '19.02 - 20.03', color: 'from-blue-400 to-cyan-500' },
];

const ASPECTS = [
  { key: 'love', label: 'Sevgi', icon: Heart, color: 'text-pink-500' },
  { key: 'career', label: 'Karyera', icon: Briefcase, color: 'text-blue-500' },
  { key: 'health', label: 'Sog\'liq', icon: Activity, color: 'text-green-500' },
  { key: 'money', label: 'Moliya', icon: DollarSign, color: 'text-yellow-500' },
  { key: 'social', label: 'Ijtimoiy', icon: Users, color: 'text-purple-500' },
];

export default function HoroscopePage() {
  const [selected, setSelected] = useState('Arslon');
  const sign = SIGNS.find((s) => s.name === selected)!;
  const ratings = { love: 85, career: 72, health: 90, money: 68, social: 78 };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Burjlar</h1>

      <Card className={cn('bg-gradient-to-br p-6 text-white', sign.color)}>
        <div className="flex items-center gap-4">
          <div className="text-7xl">{sign.emoji}</div>
          <div>
            <h2 className="text-3xl font-bold">{sign.name}</h2>
            <p className="text-sm text-white/80">{sign.dates}</p>
            <p className="mt-2 text-sm text-white/90">Bugun sizga omad va muhabbat kulib boqadi!</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ASPECTS.map((a) => (
          <Card key={a.key}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a.icon className={cn('h-5 w-5', a.color)} />
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
              <span className="text-lg font-bold">{ratings[a.key as keyof typeof ratings]}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className={cn('h-full bg-gradient-to-r', sign.color)} style={{ width: `${ratings[a.key as keyof typeof ratings]}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Batafsil prognoz</h3>
        <div className="space-y-3 text-sm">
          <p><strong className="text-brand-500">Umumiy:</strong> Bugun yaxshi kun! Yangi imkoniyatlar paydo bo\'ladi, ulardan foydalaning.</p>
          <p><strong className="text-pink-500">Sevgi:</strong> Yaqinlaringiz bilan vaqt o\'tkazing. Yangi tanishuvlar mumkin.</p>
          <p><strong className="text-blue-500">Karyera:</strong> Ishda muvaffaqiyat. Yangi loyihalar boshlang.</p>
          <p><strong className="text-green-500">Sog\'liq:</strong> Energiya yuqori. Sport bilan shug\'ullaning.</p>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold">Boshqa burjlar</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {SIGNS.map((s) => (
            <button key={s.name} onClick={() => setSelected(s.name)} className={cn('rounded-xl border p-3 text-center transition-all', selected === s.name ? 'border-brand-500 bg-brand-500/10' : 'border-border hover:bg-surface-2')}>
              <div className="text-2xl">{s.emoji}</div>
              <p className="mt-1 text-xs font-medium">{s.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
