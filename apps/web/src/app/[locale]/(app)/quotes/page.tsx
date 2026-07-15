'use client';
import { useState } from 'react';
import { Quote, Heart, Share2, Copy, RefreshCw, Bookmark, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const QUOTES = [
  { text: 'Muvaffaqiyat — bu kichik harakatlarning yig\'indisi.', author: 'Robert Collier', category: 'Muvaffaqiyat' },
  { text: 'Bugun qilgan ishing ertangi natijangizdir.', author: 'Stephen Covey', category: 'Hayot' },
  { text: 'Dunyoda eng katta xato — qo\'rqib hech narsa qilmaslik.', author: 'Mark Zuckerberg', category: 'Biznes' },
  { text: 'Bilim — kuch, lekin uni qo\'llash — haqiqiy kuch.', author: 'Benjamin Franklin', category: 'Bilim' },
  { text: 'Orzu qilish oson, lekin amalga oshirish — qiyin.', author: 'Anvar Narzullayev', category: 'Ilhom' },
  { text: 'Siz o\'ylagan narsangiz bo\'lasiz.', author: 'Buddha', category: 'Falsafa' },
  { text: 'Hech qachon taslim bo\'lmang, chunki g\'alaba yaqin.', author: 'Winston Churchill', category: 'Motivatsiya' },
  { text: 'Vaqt — bu pul emas, vaqt — bu hayot.', author: 'Robin Sharma', category: 'Hayot' },
  { text: 'Kichik qadamlar katta natijalarga olib keladi.', author: 'Confucius', category: 'Muvaffaqiyat' },
  { text: 'O\'qish — bu kelajak uchun investitsiya.', author: 'Warren Buffett', category: 'Bilim' },
  { text: 'Sevinchni boshqalar bilan baham ko\'ring, u ikki barobar ortadi.', author: 'O\'zbek xalq maqoli', category: 'Donolik' },
  { text: 'Sabr — bu eng katta kuch.', author: 'Anvar Narzullayev', category: 'Donolik' },
];

const CATEGORIES = ['Hammasi', 'Muvaffaqiyat', 'Hayot', 'Biznes', 'Bilim', 'Ilhom', 'Falsafa', 'Motivatsiya', 'Donolik'];

export default function QuotesPage() {
  const [category, setCategory] = useState('Hammasi');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([0, 4, 10]));
  const [index, setIndex] = useState(0);

  const filtered = category === 'Hammasi' ? QUOTES : QUOTES.filter((q) => q.category === category);
  const current = filtered[index % filtered.length];

  const next = () => setIndex((i) => i + 1);
  const fav = () => {
    const f = new Set(favorites);
    const idx = QUOTES.indexOf(current);
    f.has(idx) ? f.delete(idx) : f.add(idx);
    setFavorites(f);
    toast.success(f.has(idx) ? 'Saqlandi' : 'O\'chirildi');
  };
  const copy = () => { navigator.clipboard.writeText(`"${current.text}" — ${current.author}`); toast.success('Nusxalandi'); };
  const share = (network: string) => toast.success(`${network} ga ulashildi`);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Iqtiboslar</h1>

      <Card className="bg-gradient-to-br from-brand-500/10 via-pink-500/10 to-orange-500/10 p-8 text-center">
        <Quote className="mx-auto h-12 w-12 text-brand-500/30" />
        <p className="mt-4 text-2xl font-bold leading-relaxed md:text-3xl">"{current.text}"</p>
        <p className="mt-4 text-sm font-semibold text-text-muted">— {current.author}</p>
        <span className="mt-2 inline-block rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-500">{current.category}</span>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={next}><RefreshCw className="h-4 w-4" /> Boshqasi</Button>
          <Button variant="outline" onClick={fav}><Heart className={cn('h-4 w-4', favorites.has(QUOTES.indexOf(current)) && 'fill-red-500 text-red-500')} /> Saqlash</Button>
          <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> Nusxa</Button>
          <Button variant="outline" onClick={() => share('Twitter')}><Twitter className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => share('Telegram')}><Share2 className="h-4 w-4" /></Button>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => { setCategory(c); setIndex(0); }} className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((q, i) => {
          const idx = QUOTES.indexOf(q);
          return (
            <Card key={i} className={cn('group cursor-pointer transition-all hover:shadow-glow', index % filtered.length === i && 'ring-2 ring-brand-500')}>
              <Quote className="h-6 w-6 text-brand-500/30" />
              <p className="mt-2 text-sm font-medium leading-relaxed">"{q.text}"</p>
              <p className="mt-2 text-xs text-text-muted">— {q.author}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{q.category}</span>
                <button onClick={() => { const f = new Set(favorites); f.has(idx) ? f.delete(idx) : f.add(idx); setFavorites(f); }} className="opacity-0 group-hover:opacity-100">
                  <Heart className={cn('h-3.5 w-3.5', favorites.has(idx) && 'fill-red-500 text-red-500')} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
