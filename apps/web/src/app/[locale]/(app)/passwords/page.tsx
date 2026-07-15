'use client';
import { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Search, Shield, Globe, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Password { id: string; title: string; username: string; password: string; url?: string; category: string; strength: 'weak' | 'medium' | 'strong'; }

const SAMPLE: Password[] = [
  { id: '1', title: 'Google', username: 'user@gmail.com', password: '•••••••••••', url: 'google.com', category: 'Ijtimoiy', strength: 'strong' },
  { id: '2', title: 'GitHub', username: 'kryzensys', password: '•••••••••', url: 'github.com', category: 'Ish', strength: 'strong' },
  { id: '3', title: 'Telegram', username: '+998901234567', password: '••••••', url: 'telegram.org', category: 'Ijtimoiy', strength: 'medium' },
  { id: '4', title: 'Payme', username: '+998901234567', password: '•••••', url: 'payme.uz', category: 'Moliya', strength: 'weak' },
  { id: '5', title: '00o.uz', username: 'demo', password: '••••••••', url: '00o.uz', category: 'Ish', strength: 'strong' },
];

const STRENGTH_COLORS = { weak: 'bg-red-500', medium: 'bg-yellow-500', strong: 'bg-green-500' };
const STRENGTH_LABELS = { weak: 'Zaif', medium: 'O\'rta', strong: 'Kuchli' };

export default function PasswordsPage() {
  const [reveal, setReveal] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const toggle = (id: string) => {
    const r = new Set(reveal);
    r.has(id) ? r.delete(id) : r.add(id);
    setReveal(r);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Nusxalandi');
  };

  const filtered = SAMPLE.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parollar</h1>
          <p className="mt-1 text-sm text-text-muted">Xavfsiz saqlash va boshqarish</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Yangi</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><Key className="mx-auto h-8 w-8 text-brand-500" /><p className="mt-2 text-2xl font-bold">{SAMPLE.length}</p><p className="text-xs text-text-muted">jami</p></Card>
        <Card className="text-center"><Shield className="mx-auto h-8 w-8 text-green-500" /><p className="mt-2 text-2xl font-bold">{SAMPLE.filter(p => p.strength === 'strong').length}</p><p className="text-xs text-text-muted">kuchli</p></Card>
        <Card className="text-center"><Lock className="mx-auto h-8 w-8 text-red-500" /><p className="mt-2 text-2xl font-bold">{SAMPLE.filter(p => p.strength === 'weak').length}</p><p className="text-xs text-text-muted">zaif</p></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <Card key={p.id} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-pink-500 text-white"><Key className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold">{p.title}</p>
              <p className="truncate text-sm text-text-muted">{p.username}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className={cn('h-1.5 w-16 rounded-full', STRENGTH_COLORS[p.strength])} />
                <span className="text-xs text-text-muted">{STRENGTH_LABELS[p.strength]}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => toggle(p.id)} className="rounded-lg p-2 hover:bg-surface-2">{reveal.has(p.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              <button onClick={() => copy(reveal.has(p.id) ? p.password : '••••••')} className="rounded-lg p-2 hover:bg-surface-2"><Copy className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
