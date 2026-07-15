'use client';
import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function ChatPage() {
  const { user } = useAuth();
  const { data: convs } = useSWR('/chat/conversations', () => api.getConversations());
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('oo_access');
    if (!token) return;
    const url = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/api/v1/chat/ws') + `?token=${token}`;
    const socket = new WebSocket(url);
    setWs(socket);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message' && data.conversationId === active) {
        setMessages((m) => [...m, data.message]);
      }
    };
    return () => socket.close();
  }, [user, active]);

  useEffect(() => {
    if (!active) return;
    api.getMessages(active).then((r) => setMessages(r.data || []));
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !active) return;
    try {
      await api.sendMessage({ receiverId: active, content: text });
      setText('');
    } catch {}
  };

  const conversations = convs?.data || [];
  const activeConv = conversations.find((c: any) => c.id === active);

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
      <Card className="overflow-y-auto p-0">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Xabarlar</h2>
        </div>
        {conversations.length === 0 ? (
          <p className="p-6 text-center text-sm text-text-muted">Suhbatlar yo'q</p>
        ) : conversations.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn('flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-surface-2', active === c.id && 'bg-brand-500/10')}
          >
            <Avatar src={c.other?.avatar} name={c.other?.displayName || c.other?.username} />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{c.other?.displayName || c.other?.username}</p>
              <p className="truncate text-xs text-text-muted">{c.lastMessage?.content || 'Yangi suhbat'}</p>
            </div>
            {c.unread > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs text-white">{c.unread}</span>}
          </button>
        ))}
      </Card>

      <Card className="flex flex-col p-0">
        {!activeConv ? (
          <div className="flex flex-1 items-center justify-center text-text-muted">Suhbatni tanlang</div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Avatar src={activeConv.other?.avatar} name={activeConv.other?.displayName || activeConv.other?.username} />
              <div>
                <p className="font-semibold">{activeConv.other?.displayName || activeConv.other?.username}</p>
                <p className="text-xs text-green-500">online</p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m: any) => (
                <div key={m.id} className={cn('flex', m.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[70%] rounded-2xl px-4 py-2 text-sm', m.senderId === user?.id ? 'bg-brand-500 text-white' : 'bg-surface-2')}>
                    <p>{m.content}</p>
                    <p className={cn('mt-1 text-xs', m.senderId === user?.id ? 'text-white/70' : 'text-text-muted')}>{timeAgo(m.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-border p-4">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Xabar..." onKeyDown={(e) => e.key === 'Enter' && send()} />
              <Button onClick={send}><Send className="h-4 w-4" /></Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
