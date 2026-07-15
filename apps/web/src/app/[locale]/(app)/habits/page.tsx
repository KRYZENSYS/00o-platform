'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Flame, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'];
const ICONS = ['✅', '💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '✍️', '🎯'];

export default function HabitsPage() {
  const { data, mutate } = useSWR('/habits', () => api.getHabits());
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '✅', color: '#8b5cf6', frequency: 'DAILY', targetDays: [0,1,2,3,4,5,6], targetCount: 1 });

  const create = async () => {
    if (!form.name.trim()) return;
    try { await api.createHabit(form); setCreating(false); setForm({ ...form, name: '' }); mutate(); toast.success('Odat yaratildi'); }
    catch (err: any) { toast.error(err.message); }
  };

  const log = async (id: string) => {
    try { await api.logHabit(id, { count: 1 }); mutate(); toast.success('+5 XP'); }
    catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('O\'chirilsinmi?')) return;
    try { mutate(); } catch {}
  };

  const habits = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Odatlar</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Yangi odat</Button>
      </div>

      {creating && (
        <Card>
          <Input placeholder="Masalan: Ertalabki mashq" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mb-3" />
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium">Belgi</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button key={i} onClick={() => setForm({ ...form, icon: i })} className={`h-10 w-10 rounded-xl border-2 text-xl transition-all ${form.icon === i ? 'border-brand-500 bg-brand-500/10' : 'border-border'}`}>{i}</button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 text-sm font-medium">Rang</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-surface ${form.color === c ? 'ring-brand-500' : 'ring-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setCreating(false)}>Bekor</Button>
            <Button onClick={create}>Yaratish</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.length === 0 ? (
          <Card className="col-span-full"><p className="py-12 text-center text-text-muted">Odatlar yo'q. Birinchi odatni yarating!</p></Card>
        ) : habits.map((h: any) => (
          <Card key={h.id} className="group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: h.color + '20' }}>{h.icon}</div>
                <div>
                  <h3 className="font-semibold">{h.name}</h3>
                  <p className="text-xs text-text-muted">{h.totalLogs} marta</p>
                </div>
              </div>
              <button onClick={() => remove(h.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: h.color }}>
                <Flame className="h-4 w-4" /> {h.streak} kun
              </div>
              <Button size="sm" onClick={() => log(h.id)}>+1</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
