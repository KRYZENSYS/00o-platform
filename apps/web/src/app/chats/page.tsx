'use client';
import { useEffect, useState, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Image, Smile, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatRelative, cn } from '@/lib/utils';

export default function ChatsPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      api.chats.markRead(activeChat.id).catch(() => {});
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const res = await api.chats.list();
      setChats(res.data || []);
      if (res.data?.[0]) setActiveChat(res.data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const res = await api.chats.messages(chatId);
      setMessages(res.data || []);
    } catch (e) { /* ignore */ }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);
    const temp = { id: Date.now(), senderId: user?.id, content: newMessage, createdAt: new Date().toISOString(), isTemp: true };
    setMessages((m) => [...m, temp]);
    setNewMessage('');
    try {
      const res = await api.chats.sendMessage(activeChat.id, { content: temp.content, type: 'text' });
      setMessages((m) => m.map(x => x.id === temp.id ? res.data : x));
      // Update chat list
      setChats((c) => c.map(x => x.id === activeChat.id ? { ...x, lastMessage: temp.content, lastMessageAt: new Date().toISOString() } : x));
    } catch (e) {
      setMessages((m) => m.filter(x => x.id !== temp.id));
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filtered = chats.filter(c => {
    const name = c.otherUser?.firstName || c.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat list */}
      <div className={cn('w-full border-r border-slate-200 md:w-80 dark:border-slate-800', activeChat && 'hidden md:block')}>
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-3 text-lg font-bold">Xabarlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="pl-10" />
          </div>
        </div>
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 110px)' }}>
          {loading ? (
            <div className="space-y-2 p-3">{[1,2,3,4].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-500">Suhbatlar yo'q</div>
          ) : (
            filtered.map((c) => (
              <button key={c.id} onClick={() => setActiveChat(c)} className={cn('flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900', activeChat?.id === c.id && 'bg-violet-500/5')}>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white">
                    {c.otherUser?.firstName?.[0] || c.name?.[0] || '💬'}
                  </div>
                  {c.otherUser?.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{c.otherUser?.firstName || c.name}</p>
                    <span className="text-[10px] text-slate-500">{c.lastMessageAt && formatRelative(c.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{c.lastMessage || 'Yangi suhbat'}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white">{c.unreadCount}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Active chat */}
      <div className={cn('flex flex-1 flex-col', !activeChat && 'hidden md:flex')}>
        {!activeChat ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <div className="mb-2 text-4xl">💬</div>
              <p className="text-slate-500">Suhbatni tanlang</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden"><ArrowLeft className="h-5 w-5" /></button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white">
                  {activeChat.otherUser?.firstName?.[0] || activeChat.name?.[0] || '💬'}
                </div>
                <div>
                  <p className="font-semibold">{activeChat.otherUser?.firstName || activeChat.name}</p>
                  <p className="text-xs text-slate-500">{activeChat.otherUser?.isOnline ? '🟢 onlayn' : 'offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost"><Phone className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost"><Video className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">Xabarlar yo'q. Birinchi bo'lib yozing!</div>
                ) : messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2 text-sm', mine ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900')}>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={cn('mt-1 text-[10px]', mine ? 'text-white/80' : 'text-slate-500')}>{formatRelative(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-end gap-2">
                <Button size="icon" variant="ghost"><Image className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost"><Smile className="h-5 w-5" /></Button>
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Xabar yozing..."
                    rows={1}
                    className="min-h-[40px] resize-none"
                  />
                </div>
                <Button onClick={sendMessage} size="icon" variant="gradient" disabled={!newMessage.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
