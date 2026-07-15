'use client';
import { useState } from 'react';
import { Plane, Hotel, MapPin, Calendar, Users, Search, Star, Heart, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';

const TOURS = [
  { id: '1', name: 'Istanbul klassik', country: 'Turkiya', days: 5, price: 4500000, rating: 4.8, emoji: '🕌', color: 'from-red-500 to-pink-500', desc: 'Ayo Sofiya, Sultanahmet, Bosphorus' },
  { id: '2', name: 'Dubai hashamat', country: 'BAA', days: 7, price: 8900000, rating: 4.9, emoji: '🏙️', color: 'from-amber-400 to-orange-500', desc: 'Burj Khalifa, cho\'l safari' },
  { id: '3', name: 'Shri-Lanka', country: 'Shri-Lanka', days: 6, price: 5900000, rating: 4.7, emoji: '🏝️', color: 'from-green-500 to-emerald-600', desc: 'Plyajlar, budda ibodatxonalari' },
  { id: '4', name: 'Misr sirlari', country: 'Misr', days: 8, price: 6500000, rating: 4.8, emoji: '🐪', color: 'from-yellow-500 to-amber-600', desc: 'Piramidalar, Nil daryosi' },
  { id: '5', name: 'Maldiv orollari', country: 'Maldiv', days: 7, price: 12500000, rating: 4.9, emoji: '🌴', color: 'from-cyan-500 to-blue-600', desc: 'Hashamatli kurortlar' },
  { id: '6', name: 'Gruziya sarguzashtlari', country: 'Gruziya', days: 5, price: 3200000, rating: 4.7, emoji: '🏔️', color: 'from-blue-500 to-indigo-600', desc: 'Tbilisi, Kazbegi, vinolar' },
];

const HOTELS = [
  { id: '1', name: 'Hilton Tashkent', city: 'Toshkent', price: 1200000, rating: 4.8, emoji: '🏨' },
  { id: '2', name: 'Registan Plaza', city: 'Samarqand', price: 850000, rating: 4.7, emoji: '🏛️' },
  { id: '3', name: 'Bukhara Palace', city: 'Buxoro', price: 650000, rating: 4.6, emoji: '🕌' },
];

export default function TravelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sayohat</h1>
        <p className="mt-1 text-sm text-text-muted">Eng yaxshi turar joy va sayohatlar</p>
      </div>

      <Card className="bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 p-6 text-white">
        <h2 className="text-2xl font-bold">🌍 Dunyoni kashf eting</h2>
        <p className="mt-1 text-sm text-white/90">50+ davlatga sayohat</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur"><p className="text-2xl font-bold">120+</p><p className="text-xs">Turlar</p></div>
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur"><p className="text-2xl font-bold">50+</p><p className="text-xs">Davlatlar</p></div>
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur"><p className="text-2xl font-bold">5K+</p><p className="text-xs">Mijozlar</p></div>
          <div className="rounded-xl bg-white/20 p-3 backdrop-blur"><p className="text-2xl font-bold">4.9</p><p className="text-xs">Reyting</p></div>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">🔥 Mashhur turlar</h2>
          <Button variant="ghost">Barchasi <ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOURS.map((t) => (
            <Card key={t.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
              <div className={cn('relative h-40 flex items-center justify-center bg-gradient-to-br text-7xl', t.color)}>
                {t.emoji}
                <button className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur"><Heart className="h-4 w-4" /></button>
                <span className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold backdrop-blur">{t.days} kun</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-text-muted">{t.country}</p>
                <p className="mt-1 line-clamp-2 text-xs text-text-muted">{t.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">dan boshlab</p>
                    <p className="text-lg font-bold">{formatCurrency(t.price)}</p>
                  </div>
                  <Button size="sm">Buyurtma</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold">🏨 Mehmonxonalar</h2>
        <div className="space-y-3">
          {HOTELS.map((h) => (
            <Card key={h.id} className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-3xl text-white">{h.emoji}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{h.name}</h3>
                <p className="text-sm text-text-muted">{h.city} · ⭐ {h.rating}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">kechaligi</p>
                <p className="font-bold">{formatCurrency(h.price)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
