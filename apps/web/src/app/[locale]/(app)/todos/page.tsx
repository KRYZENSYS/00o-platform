'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Trash2, Check, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const priorities = [
  { value: 'LOW', label: 'Past', color: 'text-slate-500' },
  { value: 'MEDIUM', label: 'O\'rta', color: 'text-blue-500' },
  { value: 'HIGH', label: 'Yuqori', color: 'text-orange-500' },
  { value: 'URGENT', label: 'Shoshilinch', color: 'text-red-500' },
];

export default function TodosPage() {
  const { data, mutate } = useSWR('/todos', () => api.getTodos({ limit: 100 }));
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [loading, setLoading] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.createTodo({ title, priority });
      setTitle('');
      mutate();
      toast.success('Vazifa qo\'shildi');
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const toggle = async (id: string) => {
    try { await api.toggleTodo(id); mutate(); } catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    try { await api.deleteTodo(id); mutate(); toast.success('O\'chirildi'); } catch (err: any) { toast.error(err.message); }
  };

  const todos = data?.data || [];
  const completed = todos.filter((t: any) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vazifalar</h1>
          <p className="mt-1 text-text-muted">{completed}/{todos.length} bajarildi</p>
        </div>
      </div>

      <Card>
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Yangi vazifa..." value={title}
            onChange={(e) => setTitle(e.target.value)} className="flex-1"
          />
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.value} type="button"
                onClick={() => setPriority(p.value as any)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                  priority === p.value ? 'border-brand-500 bg-brand-500/10 text-brand-600' : 'border-border hover:bg-surface-2'
                )}
              >
                <Flag className={cn('inline h-3 w-3', p.color)} /> {p.label}
              </button>
            ))}
            <Button type="submit" loading={loading}><Plus className="h-4 w-4" /></Button>
          </div>
        </form>
      </Card>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <Card><p className="py-12 text-center text-text-muted">Vazifalar yo'q. Birinchi vazifani qo'shing!</p></Card>
        ) : todos.map((t: any) => (
          <Card key={t.id} className={cn('group flex items-center gap-3 p-4 transition-all', t.status === 'COMPLETED' && 'opacity-60')}>
            <button
              onClick={() => toggle(t.id)}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all',
                t.status === 'COMPLETED' ? 'border-brand-500 bg-brand-500 text-white' : 'border-border hover:border-brand-500'
              )}
            >
              {t.status === 'COMPLETED' && <Check className="h-3.5 w-3.5" />}
            </button>
            <span className={cn('flex-1', t.status === 'COMPLETED' && 'line-through')}>{t.title}</span>
            <span className="text-xs text-text-muted">{priorities.find(p => p.value === t.priority)?.label}</span>
            <button onClick={() => remove(t.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
