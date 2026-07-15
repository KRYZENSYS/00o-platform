'use client';
import { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Gauge, MapPin, Search, CloudSnow, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const CITIES = [
  { name: 'Toshkent', temp: 32, condition: 'Quyoshli', icon: Sun, high: 35, low: 22, humidity: 45, wind: 5, visibility: 10, color: 'from-amber-400 to-orange-500' },
  { name: 'Samarqand', temp: 30, condition: 'Bulutli', icon: Cloud, high: 33, low: 20, humidity: 50, wind: 7, visibility: 9, color: 'from-slate-400 to-slate-600' },
  { name: 'Buxoro', temp: 34, condition: 'Quyoshli', icon: Sun, high: 37, low: 24, humidity: 35, wind: 4, visibility: 10, color: 'from-orange-400 to-red-500' },
  { name: 'Andijon', temp: 28, condition: 'Yomg\'ir', icon: CloudRain, high: 31, low: 19, humidity: 70, wind: 6, visibility: 7, color: 'from-blue-400 to-cyan-500' },
  { name: 'Farg\'ona', temp: 29, condition: 'Quyoshli', icon: Sun, high: 32, low: 20, humidity: 48, wind: 5, visibility: 9, color: 'from-amber-400 to-orange-500' },
  { name: 'Nukus', temp: 36, condition: 'Quyoshli', icon: Sun, high: 39, low: 25, humidity: 30, wind: 8, visibility: 10, color: 'from-red-400 to-orange-500' },
];

const HOURLY = [
  { time: '12:00', temp: 32, icon: Sun },
  { time: '13:00', temp: 33, icon: Sun },
  { time: '14:00', temp: 34, icon: Sun },
  { time: '15:00', temp: 34, icon: Cloud },
  { time: '16:00', temp: 33, icon: Cloud },
  { time: '17:00', temp: 31, icon: Cloud },
  { time: '18:00', temp: 29, icon: CloudRain },
  { time: '19:00', temp: 27, icon: CloudRain },
];

const WEEKLY = [
  { day: 'Bugun', high: 35, low: 22, icon: Sun },
  { day: 'Chorshanba', high: 33, low: 21, icon: Cloud },
  { day: 'Payshanba', high: 31, low: 20, icon: CloudRain },
  { day: 'Juma', high: 30, low: 19, icon: Sun },
  { day: 'Shanba', high: 32, low: 21, icon: Sun },
  { day: 'Yakshanba', high: 34, low: 22, icon: Sun },
  { day: 'Dushanba', high: 33, low: 21, icon: Cloud },
];

export default function WeatherPage() {
  const [selected, setSelected] = useState('Toshkent');
  const city = CITIES.find((c) => c.name === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ob-havo</h1>
        <p className="mt-1 text-text-muted">Aniq prognoz, real vaqtda</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Shahar qidirish..." className="pl-10" />
      </div>

      <Card className={cn('bg-gradient-to-br p-6 text-white', city.color)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="h-4 w-4" />
              <h2 className="text-xl font-semibold">{city.name}</h2>
            </div>
            <p className="mt-1 text-sm text-white/80">{city.condition}</p>
          </div>
          <city.icon className="h-16 w-16" />
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-7xl font-bold">{city.temp}°</p>
            <p className="mt-1 text-sm text-white/80">H: {city.high}° L: {city.low}°</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-white/20 p-2 backdrop-blur">
            <Droplets className="h-4 w-4" /> {city.humidity}%
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/20 p-2 backdrop-blur">
            <Wind className="h-4 w-4" /> {city.wind} m/s
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/20 p-2 backdrop-blur">
            <Eye className="h-4 w-4" /> {city.visibility} km
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Soatlik</h3>
          <div className="flex gap-2 overflow-x-auto">
            {HOURLY.map((h) => (
              <div key={h.time} className="flex min-w-[60px] flex-col items-center gap-1 rounded-xl bg-surface-2 p-2">
                <p className="text-xs text-text-muted">{h.time}</p>
                <h.icon className="h-6 w-6 text-brand-500" />
                <p className="text-sm font-semibold">{h.temp}°</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Haftalik</h3>
          <div className="space-y-2">
            {WEEKLY.map((d) => (
              <div key={d.day} className="flex items-center justify-between rounded-xl bg-surface-2 p-2">
                <p className="w-24 text-sm">{d.day}</p>
                <d.icon className="h-5 w-5 text-brand-500" />
                <p className="text-sm font-semibold">{d.high}° / <span className="text-text-muted">{d.low}°</span></p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Boshqa shaharlar</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelected(c.name)}
              className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition-all', selected === c.name ? 'border-brand-500 bg-brand-500/10' : 'border-border hover:bg-surface-2')}
            >
              <c.icon className="h-6 w-6 text-brand-500" />
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-text-muted">{c.temp}°</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
