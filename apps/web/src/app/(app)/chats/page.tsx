'use client';
import { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, ArrowLeft, Search, Phone, Video, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function ChatsPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.chats.list().then((r) => {
      const d = r.data || {};
      setConversations(d.items || d || []);
      if ((d.items || d || []).length > 0) setActive((d.items || d)[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.chats.get(active).then((r) => {
      setMessages(r.data?.messages || r.data || []);
    });
    // WebSocket
    const token = localStorage.getItem('access_token') || '';
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000') + `/ws/chat/${active}?token=${token}`;
    try {
      const socket = new WebSocket(wsUrl);
      socket.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data);
          if (m.type === 'message') setMessages((prev) => [...prev, m.data]);
        } catch { /* ignore */ }
      };
      setWs(socket);
      return () => socket.close();
    } catch { /* ws unavailable */ }
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    const content = text.trim(); setText('');
    try {
      const r = await api.chats.send(active, { content, type: 'text' });
      const msg = r.data?.message || r.data;
      setMessages((m) => [...m, msg]);
      // Also via WebSocket
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'message', content }));
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const filtered = conversations.filter((c: any) => {
    if (!q) return true;
    const n = c.partner?.first_name || c.name || '';
    return n.toLowerCase().includes(q.toLowerCase());
  });

  const activeConv = conversations.find((c: any) => c.id === active);

  return (
    <div className="grid h-[calc(100vh-7rem)] grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <Card className={cn('flex flex-col overflow-hidden', active ? 'hidden lg:flex' : 'flex')}>
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <h2 className="mb-2 text-lg font-black">Chatlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..." className="pl-10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <MessageCircle className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">Chatlar yo\'q</p>
            </div>
          ) : (
            filtered.map((c: any) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={cn('flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition dark:border-slate-800', active === c.id ? 'bg-violet-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900')}>
                <Avatar src={c.partner?.avatar_url} alt={c.partner?.first_name || 'U'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-bold">{c.partner?.first_name || c.name || 'Chat'}</div>
                    <div className="text-[10px] text-slate-400">{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                  <div className="truncate text-xs text-slate-500">{c.last_message || 'Yozishni boshlang...'}</div>
                </div>
                {c.unread > 0 && <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">{c.unread}</span>}
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Chat window */}
      <Card className={cn('flex flex-col overflow-hidden', active ? 'flex' : 'hidden lg:flex')}>
        {!active ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Chatni tanlang</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setActive(null)} className="lg:hidden"><ArrowLeft className="h-4 w-4" /></button>
                <Avatar src={activeConv?.partner?.avatar_url} alt={activeConv?.partner?.first_name || 'U'} />
                <div>
                  <div className="text-sm font-bold">{activeConv?.partner?.first_name || 'Chat'}</div>
                  <div className="text-[10px] text-green-500">● online</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Info className="h-4 w-4" /></Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 && <div className="text-center text-sm text-slate-400 mt-10">Yozishni boshlang!</div>}
              {messages.map((m: any, i: number) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id || i} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm', mine ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-900')}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Xabar yozing..." disabled={sending} />
              <Button type="submit" variant="gradient" disabled={!text.trim() || sending}><Send className="h-4 w-4" /></Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
