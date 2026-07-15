'use client';
import { useState } from 'react';
import { Rocket, TrendingUp, Users, DollarSign, Heart, MessageCircle, Share2, Bookmark, Filter, Search, Plus, Eye, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const STARTUPS = [
  { id: '1', name: 'AI Study Buddy', tagline: 'O\'zbek tilida AI repetitor', category: 'EdTech', logo: '📚', funding: 50000, raised: 12000, investors: 5, views: 2400, likes: 234, description: 'Talabalar uchun shaxsiy AI repetitor. Matn, video va interaktiv darslar orqali o\'qitish.', location: 'Toshkent', stage: 'MVP' },
  { id: '2', name: 'FreelanceHub', tagline: 'O\'zbek frilanserlari uchun marketplace', category: 'SaaS', logo: '💼', funding: 100000, raised: 45000, investors: 12, views: 5200, likes: 412, description: 'AI portfolio builder va xizmat narxini aniqlovchi platforma. Frilanserlar uchun.', location: 'Toshkent', stage: 'Beta' },
  { id: '3', name: 'Telegram CRM', tagline: 'Kichik biznes uchun CRM', category: 'SaaS', logo: '📱', funding: 30000, raised: 18000, investors: 3, views: 1800, likes: 156, description: 'Telegram bot orqali mijozlar boshqaruvi. Avtomatik javoblar va analitika.', location: 'Samarqand', stage: 'Launched' },
  { id: '4', name: 'AgriTech AI', tagline: 'Dehqonchilik uchun AI', category: 'AgriTech', logo: '🌾', funding: 200000, raised: 75000, investors: 8, views: 3400, likes: 287, description: 'Hosil bashorati, sug\'orishni optimallashtirish va zararkunandalar monitoringi.', location: 'Andijon', stage: 'Growth' },
  { id: '5', name: 'FinTech Wallet', tagline: 'Kripto va fiat hamyoni', category: 'FinTech', logo: '💰', funding: 500000, raised: 250000, investors: 15, views: 8900, likes: 678, description: 'Kripto va fiat valyutalarni boshqarish. AI yordamida investitsiya tavsiyalari.', location: 'Toshkent', stage: 'Series A' },
  { id: '6', name: 'HealthTracker', tagline: 'AI bilan sog\'liq monitoringi', category: 'HealthTech', logo: '🏥', funding: 150000, raised: 90000, investors: 6, views: 4100, likes: 345, description: 'Smartwatch va telefon orqali sog\'liq ko\'rsatkichlarini kuzatish va AI tahlil.', location: 'Toshkent', stage: 'Beta' },
];

const CATEGORIES = ['Hammasi', 'EdTech', 'SaaS', 'AgriTech', 'FinTech', 'HealthTech', 'E-commerce'];

export default function StartupsPage() {
  const [cat, setCat] = useState('Hammasi');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = STARTUPS.filter((s) => (cat === 'Hammasi' || s.category === cat) && (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.tagline.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Startaplar 🚀</h1>
          <p className="text-sm text-slate-500">Yangi g'oyalar va investitsiya imkoniyatlari</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Startap yaratish</Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Startap qidirish..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('rounded-full px-3 py-1.5 text-xs transition-all', cat === c ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.id} className="group transition-all hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-2xl">{s.logo}</div>
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-slate-500">{s.tagline}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-red-500"><Heart className="h-4 w-4" /></button>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{s.description}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{s.category}</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{s.stage}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yig'ildi</span>
                <span className="font-semibold">${s.raised.toLocaleString()} / ${(s.funding / 1000).toFixed(0)}K</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${(s.raised / s.funding) * 100}%` }} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {s.views}</span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {s.likes}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.investors}</span>
              </div>
              <Button size="sm" variant="outline">Batafsil</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
