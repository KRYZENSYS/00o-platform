'use client';
import { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, DollarSign, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  like: Heart, comment: MessageCircle, follow: UserPlus,
  payment: DollarSign, ai: Sparkles, default: Bell,
};
const COLORS: Record<string, string> = {
  like: 'text-pink-500 bg-pink-500/10',
  comment: 'text-blue-500 bg-blue-500/10',
  follow: 'text-green-500 bg-green-500/10',
  payment: 'text-amber-500 bg-amber-500/10',
  ai: 'text-violet-500 bg-violet-500/10',
};

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.notifications.list();
      setItems(r.data?.items || r.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    setItems((a) => a.map((x) => x.id === id ? { ...x, read: true } : x));
    try { await api.notifications.markRead(id); } catch { /* ignore */ }
  };

  const markAll = async () => {
    setItems((a) => a.map((x) => ({ ...x, read: true })));
    try { await api.notifications.markAllRead(); } catch { /* ignore */ }
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Bildirishnomalar {unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs">{unread}</span>}</h1>
        </div>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAll}><Check className="h-4 w-4" /> Hammasini o\'qildi</Button>}
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Bell className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">Bildirishnomalar yo\'q</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((n: any) => {
            const Icon = ICONS[n.type] || Bell;
            const color = COLORS[n.type] || 'text-slate-500 bg-slate-500/10';
            return (
              <Card key={n.id} className={cn('cursor-pointer transition hover:shadow-md', !n.read && 'border-violet-500/50 bg-violet-500/5')} onClick={() => markRead(n.id)}>
                <CardContent className="flex items-start gap-3 p-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', color.split(' ')[1])}>
                    <Icon className={cn('h-5 w-5', color.split(' ')[0])} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{n.title || n.type}</div>
                    <p className="line-clamp-2 text-xs text-slate-500">{n.message || n.content}</p>
                    <div className="mt-1 text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
