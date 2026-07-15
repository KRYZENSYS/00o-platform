'use client';
import { useState } from 'react';
import { MapPin, Navigation, Search, Star, Phone, Clock, Compass, Save, Share2, Filter, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PLACES = [
  { id: '1', name: 'Toshkent markazi', category: 'Shahar', rating: 4.8, distance: '0 km', emoji: '🏙️', color: 'from-blue-500 to-cyan-500', desc: 'O\'zbekiston poytaxti' },
  { id: '2', name: 'Registon maydoni', category: 'Tarix', rating: 4.9, distance: '270 km', emoji: '🏛️', color: 'from-amber-500 to-yellow-600', desc: 'Samarqand tarixiy yodgorligi' },
  { id: '3', name: 'Ittifoq (Amirsoy)', category: 'Tabiat', rating: 4.7, distance: '70 km', emoji: '🏔️', color: 'from-green-500 to-emerald-600', desc: 'Tog\' kurorti' },
  { id: '4', name: 'Aral dengizi', category: 'Tabiat', rating: 4.3, distance: '450 km', emoji: '🌊', color: 'from-cyan-500 to-blue-600', desc: 'Orol dengizi qoldiqlari' },
  { id: '5', name: 'Ichan-Qal\'a', category: 'Tarix', rating: 4.8, distance: '700 km', emoji: '🏯', color: 'from-orange-500 to-red-500', desc: 'Xiva shahri' },
  { id: '6', name: 'Chotqol milliy bog\'i', category: 'Tabiat', rating: 4.6, distance: '90 km', emoji: '🌲', color: 'from-emerald-500 to-teal-600', desc: 'Milliy tabiat bog\'i' },
  { id: '7', name: 'Buxoro ark\'i', category: 'Tarix', rating: 4.7, distance: '440 km', emoji: '🕌', color: 'from-purple-500 to-violet-600', desc: 'Qadimiy qal\'a' },
  { id: '8', name: 'Charvok suv ombori', category: 'Dam olish', rating: 4.5, distance: '80 km', emoji: '🏖️', color: 'from-sky-500 to-blue-500', desc: 'Suv ombori plyajlari' },
];

const CATEGORIES = ['Hammasi', 'Shahar', 'Tarix', 'Tabiat', 'Dam olish'];

export default function MapsPage() {
  const [category, setCategory] = useState('Hammasi');
  const filtered = PLACES.filter((p) => category === 'Hammasi' || p.category === category);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Xarita</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Joy qidirish..." className="pl-10" />
      </div>

      <Card className="relative h-72 overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 p-0">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        {PLACES.slice(0, 4).map((p, i) => (
          <div key={p.id} className="absolute" style={{ left: `${20 + i * 18}%`, top: `${30 + (i % 2) * 30}%` }}>
            <div className="relative">
              <div className="absolute -inset-4 animate-ping rounded-full bg-white/30" />
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-lg', p.color)}>
                {p.emoji}
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 backdrop-blur">
          📍 Toshkent, O\'zbekiston
        </div>
        <Button className="absolute bottom-4 right-4" size="sm"><Navigation className="h-4 w-4" /> Yo\'nalish</Button>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((p) => (
          <Card key={p.id} className="group cursor-pointer transition-all hover:shadow-glow">
            <div className="flex items-start gap-3">
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white shadow-md', p.color)}>
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-text-muted">{p.desc}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" />{p.rating}</span>
                  <span className="text-text-muted">📏 {p.distance}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{p.category}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
