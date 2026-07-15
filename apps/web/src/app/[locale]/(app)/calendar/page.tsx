'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Clock, MapPin, Users, Repeat } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Event { id: string; title: string; date: string; time: string; color: string; location?: string; }

const SAMPLE_EVENTS: Event[] = [
  { id: '1', title: 'Jamoa uchrashuvi', date: '2026-07-15', time: '10:00', color: 'bg-blue-500', location: 'Ofis' },
  { id: '2', title: 'Tug\'ilgan kun', date: '2026-07-15', time: '18:00', color: 'bg-pink-500', location: 'Restoran' },
  { id: '3', title: 'Sport zali', date: '2026-07-16', time: '07:00', color: 'bg-green-500' },
  { id: '4', title: 'Doktor qabuli', date: '2026-07-18', time: '14:30', color: 'bg-red-500', location: 'Klinika' },
  { id: '5', title: 'Sayohat', date: '2026-07-20', time: '09:00', color: 'bg-purple-500', location: 'Samarqand' },
];

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const WEEKDAYS = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

export default function CalendarPage() {
  const [date, setDate] = useState(new Date(2026, 6, 15));
  const [selected, setSelected] = useState('2026-07-15');

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const days: ({ day: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, dateStr });
  }

  const dayEvents = SAMPLE_EVENTS.filter((e) => e.date === selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kalendar</h1>
        <Button><Plus className="h-4 w-4" /> Tadbir</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
            <div className="flex gap-1">
              <button onClick={() => setDate(new Date(year, month - 1, 1))} className="rounded-lg p-2 hover:bg-surface-2"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setDate(new Date())} className="rounded-lg px-3 py-1 text-sm hover:bg-surface-2">Bugun</button>
              <button onClick={() => setDate(new Date(year, month + 1, 1))} className="rounded-lg p-2 hover:bg-surface-2"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-muted">
            {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = d.day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasEvent = SAMPLE_EVENTS.some((e) => e.date === d.dateStr);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(d.dateStr)}
                  className={cn('relative aspect-square rounded-xl text-sm transition-all', selected === d.dateStr ? 'bg-brand-500 text-white' : isToday ? 'bg-brand-500/10 text-brand-500 font-semibold' : 'hover:bg-surface-2')}
                >
                  {d.day}
                  {hasEvent && <span className={cn('absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', selected === d.dateStr ? 'bg-white' : 'bg-brand-500')} />}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">{selected.split('-').reverse().join('.')}</h3>
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">Tadbirlar yo\'q</p>
            ) : dayEvents.map((e) => (
              <div key={e.id} className="flex gap-3 rounded-xl bg-surface-2 p-3">
                <div className={cn('w-1 rounded-full', e.color)} />
                <div className="flex-1">
                  <p className="font-semibold">{e.title}</p>
                  <p className="flex items-center gap-1 text-xs text-text-muted"><Clock className="h-3 w-3" />{e.time}</p>
                  {e.location && <p className="flex items-center gap-1 text-xs text-text-muted"><MapPin className="h-3 w-3" />{e.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
