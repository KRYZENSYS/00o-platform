'use client';
import { useState } from 'react';
import { Star, Clock, DollarSign, Heart, MessageCircle, Search, Filter, Plus, MapPin, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const SERVICES = [
  { id: '1', title: 'AI Chatbot yaratish', seller: { name: 'Aziz Karimov', avatar: 'AK', level: 'Pro' }, price: 1500000, rating: 4.9, reviews: 127, delivery: 7, category: 'AI/ML', description: 'Telegram, WhatsApp, web uchun AI chatbotlar. NLP, GPT integratsiya.', tags: ['AI', 'Chatbot', 'NLP'], orders: 234, image: '🤖' },
  { id: '2', title: 'Full-stack web dasturlash', seller: { name: 'Malika Y.', avatar: 'MY', level: 'Top' }, price: 5000000, rating: 5.0, reviews: 89, delivery: 14, category: 'Dasturlash', description: 'Next.js, React, Node.js bilan to\'liq web ilovalar. Responsive, PWA, SEO.', tags: ['Next.js', 'React', 'Node'], orders: 156, image: '💻' },
  { id: '3', title: 'Logo va brending', seller: { name: 'Sardor', avatar: 'S', level: 'Pro' }, price: 800000, rating: 4.8, reviews: 234, delivery: 3, category: 'Dizayn', description: 'Professional logo, brandbook, vizitka, banner dizayni. 3 ta variant.', tags: ['Logo', 'Branding', 'Figma'], orders: 445, image: '🎨' },
  { id: '4', title: 'Mobile app development', seller: { name: 'Bobur', avatar: 'B', level: 'Pro' }, price: 8000000, rating: 4.9, reviews: 67, delivery: 30, category: 'Dasturlash', description: 'iOS va Android uchun native va cross-platform mobil ilovalar. React Native, Flutter.', tags: ['Mobile', 'iOS', 'Android'], orders: 89, image: '📱' },
  { id: '5', title: 'SMM va kontent yaratish', seller: { name: 'Nodira', avatar: 'N', level: 'Pro' }, price: 2000000, rating: 4.7, reviews: 156, delivery: 5, category: 'Marketing', description: 'Instagram, Facebook, Telegram uchun kontent rejasi va yaratish. 30 ta post/oy.', tags: ['SMM', 'Kontent', 'Marketing'], orders: 278, image: '📢' },
  { id: '6', title: 'Video montaj', seller: { name: 'Jasur', avatar: 'J', level: 'Pro' }, price: 600000, rating: 4.8, reviews: 198, delivery: 2, category: 'Video', description: 'YouTube, Reels, TikTok uchun professional video montaj. 4K, effektlar.', tags: ['Video', 'Montaj', 'Reels'], orders: 367, image: '🎬' },
];

const CATEGORIES = ['Hammasi', 'Dasturlash', 'Dizayn', 'Marketing', 'AI/ML', 'Video', 'Matn'];

export default function MarketplacePage() {
  const [cat, setCat] = useState('Hammasi');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter((s) => (cat === 'Hammasi' || s.category === cat) && (search === '' || s.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Marketplace 💼</h1>
          <p className="text-sm text-slate-500">Professional xizmatlar toping yoki o'z xizmatingizni taklif qiling</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Xizmat qo'shish</Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Xizmat qidirish..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
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
            <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10 text-6xl">{s.image}</div>

            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-bold">{s.title}</h3>
              <button className="text-slate-400 hover:text-red-500"><Heart className="h-4 w-4" /></button>
            </div>

            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.description}</p>

            <div className="mt-3 flex flex-wrap gap-1">
              {s.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{t}</span>)}
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Avatar name={s.seller.avatar} size="sm" />
              <div className="flex-1">
                <p className="text-xs font-semibold">{s.seller.name}</p>
                <p className="flex items-center gap-1 text-[10px] text-slate-500"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {s.rating} · {s.reviews} reviews</p>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', s.seller.level === 'Top' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>{s.seller.level}</span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500">Boshlanish narxi</p>
                <p className="text-lg font-bold text-violet-500">{(s.price / 1000000).toFixed(1)}M so'm</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.delivery}d</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {s.orders}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
