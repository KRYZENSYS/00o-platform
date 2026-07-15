'use client';
import { useState } from 'react';
import { Star, ShoppingCart, Coins, Filter, Search, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';

interface Product { id: string; name: string; price: number; oldPrice?: number; image: string; category: string; rating: number; reviews: number; badge?: string; }

const CATEGORIES = ['Hammasi', 'Elektronika', 'Kiyim', 'Uy-ro\'zg\'or', 'Sovg\'alar', 'Kitoblar', 'Sport', 'Go\'zallik'];
const PRODUCTS: Product[] = [
  { id: '1', name: 'Samsung Galaxy S25', price: 12990000, oldPrice: 14990000, image: '📱', category: 'Elektronika', rating: 4.8, reviews: 234, badge: 'Hit' },
  { id: '2', name: 'Apple AirPods Pro', price: 2990000, image: '🎧', category: 'Elektronika', rating: 4.9, reviews: 567 },
  { id: '3', name: 'Nike Air Max', price: 1290000, oldPrice: 1590000, image: '👟', category: 'Sport', rating: 4.7, reviews: 123, badge: '-19%' },
  { id: '4', name: 'Kitob: Atomic Habits', price: 79000, image: '📚', category: 'Kitoblar', rating: 4.9, reviews: 892 },
  { id: '5', name: 'Macbook Air M3', price: 17990000, image: '💻', category: 'Elektronika', rating: 4.9, reviews: 89, badge: 'New' },
  { id: '6', name: 'Lego Classic 484', price: 449000, image: '🧱', category: 'Sovg\'alar', rating: 4.8, reviews: 234 },
  { id: '7', name: 'Kiyim kombinezon', price: 549000, oldPrice: 799000, image: '👕', category: 'Kiyim', rating: 4.5, reviews: 67, badge: '-31%' },
  { id: '8', name: 'Yuz parvarish to\'plami', price: 349000, image: '🧴', category: 'Go\'zallik', rating: 4.6, reviews: 145 },
  { id: '9', name: 'Bluetooth karnay', price: 459000, oldPrice: 599000, image: '🔊', category: 'Elektronika', rating: 4.4, reviews: 198 },
  { id: '10', name: 'Yostiqqa to\'plam', price: 899000, image: '🛏️', category: 'Uy-ro\'zg\'or', rating: 4.7, reviews: 56 },
  { id: '11', name: 'Yoga mat', price: 159000, image: '🧘', category: 'Sport', rating: 4.8, reviews: 234 },
  { id: '12', name: 'Aromaterapiya', price: 89000, image: '🕯️', category: 'Uy-ro\'zg\'or', rating: 4.6, reviews: 78 },
];

export default function StorePage() {
  const [category, setCategory] = useState('Hammasi');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['4']));

  const filtered = PRODUCTS.filter((p) => (category === 'Hammasi' || p.category === category) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));

  const buy = (p: Product) => toast.success(`"${p.name}" savatga qo'shildi!`);
  const toggleFav = (id: string) => {
    const f = new Set(favorites);
    f.has(id) ? f.delete(id) : f.add(id);
    setFavorites(f);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Do'kon</h1>
          <p className="mt-1 text-text-muted">Eng yaxshi mahsulotlar</p>
        </div>
        <Button variant="outline" className="gap-2"><ShoppingCart className="h-4 w-4" /> Savat <span className="rounded-full bg-brand-500 px-2 text-xs text-white">3</span></Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Mahsulot qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-all', category === c ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id} className="group overflow-hidden p-0">
            <div className="relative aspect-square bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center text-7xl">
              {p.image}
              {p.badge && <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{p.badge}</span>}
              <button
                onClick={() => toggleFav(p.id)}
                className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 backdrop-blur transition-transform hover:scale-110"
              >
                <Heart className={cn('h-4 w-4', favorites.has(p.id) ? 'fill-red-500 text-red-500' : 'text-text-muted')} />
              </button>
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-semibold">{p.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="font-medium">{p.rating}</span>
                <span className="text-text-muted">({p.reviews})</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{formatCurrency(p.price)}</p>
                  {p.oldPrice && <p className="text-xs text-text-muted line-through">{formatCurrency(p.oldPrice)}</p>}
                </div>
                <Button size="sm" onClick={() => buy(p)}>+</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
