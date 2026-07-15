'use client';
import { useState } from 'react';
import { Image as ImageIcon, Music, Video, Upload, Play, Heart, Download, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PHOTOS = [
  { id: '1', url: '🌅', title: 'Toshkent ertalab', likes: 234, color: 'from-orange-400 to-pink-500' },
  { id: '2', url: '🏔️', title: 'Tog\'lar', likes: 567, color: 'from-blue-400 to-cyan-500' },
  { id: '3', url: '🌸', title: 'Bahor', likes: 892, color: 'from-pink-400 to-rose-500' },
  { id: '4', url: '🌃', title: 'Tungi shahar', likes: 445, color: 'from-purple-500 to-indigo-600' },
  { id: '5', url: '🏖️', title: 'Orol dengizi', likes: 678, color: 'from-cyan-400 to-blue-500' },
  { id: '6', url: '🌲', title: 'O\'rmon', likes: 234, color: 'from-green-500 to-emerald-600' },
  { id: '7', url: '🌅', title: 'Quyosh botishi', likes: 1234, color: 'from-red-400 to-orange-500' },
  { id: '8', url: '🎭', title: 'Madaniyat', likes: 156, color: 'from-amber-500 to-yellow-500' },
  { id: '9', url: '🏛️', title: 'Tarix', likes: 389, color: 'from-stone-500 to-amber-600' },
];

const MUSIC = [
  { id: '1', title: 'Yurak', artist: 'Shahzoda', duration: '3:45', cover: '🎵' },
  { id: '2', title: 'Sevgi', artist: 'Yulduz Usmonova', duration: '4:12', cover: '🎶' },
  { id: '3', title: 'Onam', artist: 'Ozoda Nursaidova', duration: '3:58', cover: '🎼' },
  { id: '4', title: 'Vatan', artist: 'Sherzod', duration: '4:30', cover: '🎤' },
  { id: '5', title: 'Kuz', artist: 'Rayhon', duration: '3:20', cover: '🎸' },
];

export default function MediaPage() {
  const [tab, setTab] = useState<'photos' | 'music' | 'videos'>('photos');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Media</h1>
        <Button><Upload className="h-4 w-4" /> Yuklash</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'photos', label: 'Rasmlar', icon: ImageIcon },
          { id: 'music', label: 'Musiqa', icon: Music },
          { id: 'videos', label: 'Videolar', icon: Video },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn('flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors', tab === t.id ? 'border-brand-500 text-brand-500' : 'border-transparent text-text-muted hover:text-text')}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'photos' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PHOTOS.map((p) => (
            <Card key={p.id} className="group cursor-pointer overflow-hidden p-0">
              <div className={cn('relative aspect-square flex items-center justify-center bg-gradient-to-br text-7xl transition-transform group-hover:scale-105', p.color)}>
                {p.url}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-sm font-semibold text-white">{p.title}</p>
                    <p className="flex items-center gap-1 text-xs text-white/80"><Heart className="h-3 w-3 fill-current" /> {p.likes}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'music' && (
        <div className="space-y-2">
          {MUSIC.map((m, i) => (
            <Card key={m.id} className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-2xl text-white shadow-md">{m.cover}</div>
              <div className="flex-1">
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-text-muted">{m.artist} · {m.duration}</p>
              </div>
              <Button size="icon" variant="ghost"><Play className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost"><Heart className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'videos' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="group cursor-pointer overflow-hidden p-0">
              <div className="relative aspect-video flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-4xl text-white">
                🎬
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold">Video #{i}</p>
                <p className="text-xs text-text-muted">2:34 · 1.2k ko'rishlar</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
