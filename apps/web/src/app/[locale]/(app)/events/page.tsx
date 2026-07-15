'use client';
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Heart, Share2, Plus, Ticket, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';

const EVENTS = [
  { id: '1', title: 'Toshkent Tech Conference 2026', date: '2026-08-15', time: '10:00', location: 'Toshkent', category: 'Konferensiya', price: 150000, attendees: 450, capacity: 500, online: false, color: 'from-blue-500 to-cyan-500', emoji: '💼' },
  { id: '2', title: 'Musiqa festivali', date: '2026-08-20', time: '19:00', location: 'Samarqand', category: 'Festival', price: 80000, attendees: 1200, capacity: 2000, online: false, color: 'from-pink-500 to-rose-600', emoji: '🎵' },
  { id: '3', title: 'IT Workshop: AI asoslari', date: '2026-07-25', time: '14:00', location: 'Online', category: 'Workshop', price: 0, attendees: 234, capacity: 500, online: true, color: 'from-violet-500 to-purple-600', emoji: '🤖' },
  { id: '4', title: 'Startup Networking', date: '2026-07-30', time: '18:00', location: 'Toshkent', category: 'Networking', price: 50000, attendees: 89, capacity: 100, online: false, color: 'from-amber-500 to-orange-600', emoji: '🤝' },
  { id: '5', title: 'Sport musobaqasi', date: '2026-09-05', time: '15:00', location: 'Buxoro', category: 'Sport', price: 30000, attendees: 567, capacity: 1000, online: false, color: 'from-green-500 to-emerald-600', emoji: '⚽' },
  { id: '6', title: 'Kitob ko\'rgazmasi', date: '2026-08-10', time: '11:00', location: 'Online', category: 'Madaniyat', price: 0, attendees: 345, capacity: 1000, online: true, color: 'from-red-500 to-pink-600', emoji: '📚' },
];

const CATEGORIES = ['Hammasi', 'Konferensiya', 'Festival', 'Workshop', 'Networking', 'Sport', 'Madaniyat'];

export default function EventsPage() {
  const [category, setCategory] = useState('Hammasi');
  const filtered = EVENTS.filter((e) => category === 'Hammasi' || e.category === category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tadbirlar</h1>
        <Button><Plus className="h-4 w-4" /> Yaratish</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <Card key={e.id} className="group cursor-pointer overflow-hidden p-0 transition-all hover:shadow-glow">
            <div className={cn('relative h-40 flex items-center justify-center bg-gradient-to-br text-7xl', e.color)}>
              {e.emoji}
              {e.online && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white"><Video className="h-3 w-3" /> Online</span>}
            </div>
            <div className="p-4">
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{e.category}</span>
              <h3 className="mt-2 line-clamp-2 font-semibold">{e.title}</h3>
              <div className="mt-2 space-y-1 text-xs text-text-muted">
                <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{e.date} · {e.time}</p>
                <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>
                <p className="flex items-center gap-1"><Users className="h-3 w-3" />{e.attendees}/{e.capacity}</p>
              </div>
              <div className="mt-3">
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-pink-500" style={{ width: `${(e.attendees / e.capacity) * 100}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">{e.price === 0 ? 'Bepul' : 'dan boshlab'}</p>
                    <p className="font-bold">{e.price === 0 ? '🎁' : formatCurrency(e.price)}</p>
                  </div>
                  <Button size="sm"><Ticket className="h-3.5 w-3.5" /> Chipta</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
