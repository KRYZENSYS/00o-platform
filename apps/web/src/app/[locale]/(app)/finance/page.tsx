'use client';
import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface Tx { id: string; amount: number; type: 'INCOME' | 'EXPENSE'; category: string; note: string; date: string; }
const CATEGORIES = { INCOME: ['Maosh', 'Biznes', 'Sovg\'a', 'Boshqa'], EXPENSE: ['Oziq-ovqat', 'Transport', 'Kommunal', 'Kiyim', 'Ko\'ngil ochar', 'Boshqa'] };

export default function FinancePage() {
  const [txs, setTxs] = useState<Tx[]>([
    { id: '1', amount: 5000000, type: 'INCOME', category: 'Maosh', note: 'Iyun oyi', date: '2026-07-01' },
    { id: '2', amount: 150000, type: 'EXPENSE', category: 'Oziq-ovqat', note: 'Korzinka', date: '2026-07-05' },
    { id: '3', amount: 50000, type: 'EXPENSE', category: 'Transport', note: 'Benzin', date: '2026-07-08' },
  ]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE', category: 'Oziq-ovqat', note: '' });

  const add = () => {
    if (!form.amount) return;
    setTxs([{ id: Date.now().toString(), amount: +form.amount, type: form.type, category: form.category, note: form.note, date: new Date().toISOString().split('T')[0] }, ...txs]);
    setForm({ amount: '', type: 'EXPENSE', category: 'Oziq-ovqat', note: '' });
    setAdding(false);
  };

  const income = txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moliya</h1>
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Tranzaksiya</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white"><TrendingUp className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Daromad</p><p className="text-2xl font-bold text-green-500">{formatCurrency(income)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-gradient-to-br from-red-500 to-pink-600 p-3 text-white"><TrendingDown className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Xarajat</p><p className="text-2xl font-bold text-red-500">{formatCurrency(expense)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 text-white"><Wallet className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Balans</p><p className="text-2xl font-bold">{formatCurrency(balance)}</p></div></div></Card>
      </div>

      {adding && (
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder="Summa" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any, category: CATEGORIES[e.target.value as keyof typeof CATEGORIES][0] })} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm">
              <option value="EXPENSE">Xarajat</option>
              <option value="INCOME">Daromad</option>
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm">
              {CATEGORIES[form.type].map((c) => <option key={c}>{c}</option>)}
            </select>
            <Input placeholder="Izoh" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>Bekor</Button>
            <Button onClick={add}>Qo'shish</Button>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold">Tranzaksiyalar</h2>
        <div className="space-y-2">
          {txs.length === 0 ? <p className="text-sm text-text-muted">Tranzaksiyalar yo'q</p> : txs.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-surface-2 p-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {t.type === 'INCOME' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.category}</p>
                  <p className="text-xs text-text-muted">{t.note || t.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${t.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
                {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
