'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Trash2, Pin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';

export default function NotesPage() {
  const { data, mutate } = useSWR('/notes', () => api.getNotes({ limit: 50 }));
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', color: '#8b5cf6' });
  const [search, setSearch] = useState('');

  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const create = async () => {
    if (!form.title.trim()) return;
    try {
      await api.createNote(form);
      setForm({ title: '', content: '', color: '#8b5cf6' });
      setCreating(false);
      mutate();
      toast.success('Eslatma yaratildi');
    } catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('O\'chirilsinmi?')) return;
    try { await api.deleteNote(id); mutate(); } catch (err: any) { toast.error(err.message); }
  };

  const notes = (data?.data || []).filter((n: any) => !search || n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eslatmalar</h1>
        <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Yangi</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input placeholder="Qidirish..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {creating && (
        <Card>
          <Input placeholder="Sarlavha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mb-3" autoFocus />
          <textarea
            placeholder="Matn..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" rows={5}
          />
          <div className="mt-3 flex items-center gap-2">
            {colors.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} className={cn('h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-surface', form.color === c ? 'ring-brand-500' : 'ring-transparent')} style={{ backgroundColor: c }} />
            ))}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" onClick={() => setCreating(false)}>Bekor</Button>
              <Button onClick={create}>Saqlash</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 ? (
          <Card className="col-span-full"><p className="py-12 text-center text-text-muted">Eslatmalar yo'q</p></Card>
        ) : notes.map((n: any) => (
          <Card key={n.id} className="group relative" style={{ borderTop: `4px solid ${n.color}` }}>
            {n.isPinned && <Pin className="absolute right-3 top-3 h-4 w-4 fill-current text-brand-500" />}
            <h3 className="font-semibold">{n.title}</h3>
            <p className="mt-2 line-clamp-4 text-sm text-text-muted">{n.content}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>{timeAgo(n.updatedAt)}</span>
              <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
