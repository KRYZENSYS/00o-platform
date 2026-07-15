'use client';
import { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatPreview { id: string; name: string; lastMsg: string; time: string; unread: number; online: boolean; avatar: string; }
interface Message { id: string; from: 'me' | 'them'; text: string; time: string; read?: boolean; }

const CHATS: ChatPreview[] = [
  { id: '1', name: 'Aziz Karimov', lastMsg: 'Salom, loyiha haqida gaplashaylikmi?', time: '2 daq', unread: 2, online: true, avatar: 'AK' },
  { id: '2', name: 'Malika Yusupova', lastMsg: 'Resume tayyor! 👌', time: '15 daq', unread: 0, online: true, avatar: 'MY' },
  { id: '3', name: 'Bobur Ergashev', lastMsg: 'Investitsiya taklifini ko\'rib chiqdim...', time: '1 soat', unread: 0, online: false, avatar: 'BE' },
  { id: '4', name: 'AI Assistant', lastMsg: 'Sizning codingiz tayyor! 🚀', time: '2 soat', unread: 0, online: true, avatar: '🤖' },
  { id: '5', name: 'Design Team', lastMsg: 'Yangi mockuplar tayyor', time: '3 soat', unread: 5, online: false, avatar: 'DT' },
  { id: '6', name: 'Nodir', lastMsg: 'Ertaga uchrashamiz', time: 'Kecha', unread: 0, online: false, avatar: 'N' },
  { id: '7', name: 'Sardor', lastMsg: '✅ Qabul qilindi', time: 'Kecha', unread: 0, online: true, avatar: 'S' },
];

const MESSAGES: Message[] = [
  { id: '1', from: 'them', text: 'Salom! Qanday yordam bera olaman?', time: '10:30' },
  { id: '2', from: 'me', text: 'Salom! Menda startup g\'oya bor, AI marketplace uchun', time: '10:31', read: true },
  { id: '3', from: 'them', text: 'Juda qiziq! G\'oyangiz haqida batafsil aytib bering', time: '10:32' },
  { id: '4', from: 'me', text: 'O\'zbek tilida ishlaydigan AI marketplace, startaplar va frilanserlar uchun. MVP qilmoqchiman.', time: '10:33', read: true },
  { id: '5', from: 'them', text: 'Ajoyib g\'oya! 00o.uz platformasiga o\'xshash. Texnologiyalar haqida nima deysiz?', time: '10:35' },
  { id: '6', from: 'me', text: 'Next.js, FastAPI, Postgres, AI uchun GroqCloud ishlatmoqchiman', time: '10:36', read: true },
  { id: '7', from: 'them', text: 'Zo\'r stack! Qancha vaqtda MVP tayyor bo\'ladi?', time: '10:37' },
  { id: '8', from: 'me', text: 'Taxminan 2-3 oy. Jamoa kerak bo\'ladi', time: '10:38', read: false },
];

export default function ChatPage() {
  const [selected, setSelected] = useState(CHATS[0]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  const filtered = CHATS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat List */}
      <div className={cn('flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80', 'md:flex')}>
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="mb-3 text-lg font-bold">Xabarlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className={cn('flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/50', selected.id === c.id && 'bg-violet-500/5')}>
              <div className="relative">
                <Avatar name={c.avatar} />
                {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn('truncate text-sm', c.unread > 0 ? 'font-bold' : 'font-semibold')}>{c.name}</p>
                  <span className="text-xs text-slate-500">{c.time}</span>
                </div>
                <p className={cn('truncate text-xs', c.unread > 0 ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-500')}>{c.lastMsg}</p>
              </div>
              {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-1.5 text-xs font-bold text-white">{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn('hidden flex-1 flex-col md:flex', selected ? 'flex' : 'hidden md:flex')}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/50 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={selected.avatar} />
              {selected.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />}
            </div>
            <div>
              <p className="font-semibold">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.online ? 'Onlayn' : 'Oxirgi marta 2 soat oldin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {MESSAGES.map((m) => (
            <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[70%] rounded-2xl px-4 py-2', m.from === 'me' ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-900')}>
                <p className="text-sm">{m.text}</p>
                <div className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', m.from === 'me' ? 'text-white/80' : 'text-slate-500')}>
                  {m.time}
                  {m.from === 'me' && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-900">Bugun</span></div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
            <div className="relative flex-1">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder="Xabar yozing..." className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"><Smile className="h-4 w-4" /></button>
            </div>
            {text.trim() ? (
              <Button size="icon"><Send className="h-4 w-4" /></Button>
            ) : (
              <Button size="icon" variant="ghost"><Mic className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
