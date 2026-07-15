'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, Mic, Paperclip, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  { icon: '💡', text: 'Biznes g\'oya yaratishga yordam ber' },
  { icon: '✍️', text: 'Matn yozishda yordam ber' },
  { icon: '🌐', text: 'Tarjima qilib ber' },
  { icon: '📊', text: 'Ma\'lumotlarni tahlil qil' },
  { icon: '🎨', text: 'Dizayn g\'oyasi kerak' },
  { icon: '💻', text: 'Kod yozishda yordam' },
];

const RESPONSES: { [key: string]: string } = {
  default: 'Yaxshi savol! Men 00o.uz AI yordamchisiman. Sizga qanday yordam bera olaman? Kodlash, yozish, tahlil, tarjima, g\'oyalar - barchasida yordam beraman! 🚀',
  biznes: 'Ajoyib! Mana 3 ta biznes g\'oya:\n\n1. 📱 O\'zbek tilidagi til o\'rganish ilovasi\n2. 🛒 Mahalliy ishlab chiqaruvchilar uchun onlayn bozor\n3. 💼 Freelancerlar uchun portfolio platformasi\n\nQaysi birini rivojlantiramiz?',
  kod: 'Kodlash bo\'yicha yordam berishdan xursandman! Qaysi tilda kod yozmoqchisiz? (JavaScript, Python, TypeScript, Go, Rust)\n\nLoyihangiz haqida batafsilroq yozing - men sizga to\'liq kod, arxitektura va eng yaxshi amaliyotlarni taklif qilaman!',
  tarjima: 'Tarjima qilish uchun matn yuboring! Men 12+ tilda ishlayman:\n🇺🇿 O\'zbek, 🇷🇺 Rus, 🇬🇧 Ingliz, 🇹🇷 Turk, 🇰🇿 Qozoq, va boshqalar',
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Salom! Men Mira AI 🤖\n\nSizga qanday yordam bera olaman? G\'oya, kod, matn, tahlil - har qanday savol bilan yozishingiz mumkin!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = RESPONSES.default;
      if (lower.includes('biznes') || lower.includes('g\'oya')) reply = RESPONSES.biznes;
      else if (lower.includes('kod') || lower.includes('dastur')) reply = RESPONSES.kod;
      else if (lower.includes('tarjim') || lower.includes('translate')) reply = RESPONSES.tarjima;
      else if (lower.includes('salom') || lower.includes('hi')) reply = 'Salom! Qalaysiz? Bugun qanday yordam kerak? 😊';
      else if (lower.includes('rahmat')) reply = 'Arzimaydi! Yana savollaringiz bo\'lsa, bemalol yozing! 🌟';

      setMessages((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: reply }]);
      setLoading(false);
    }, 1000);
  };

  const reset = () => setMessages([{ id: '1', role: 'assistant', content: 'Salom! Yangi suhbat boshlandi. Qanday yordam kerak?' }]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold"><Sparkles className="h-7 w-7 text-brand-500" /> AI Yordamchi</h1>
          <p className="mt-1 text-sm text-text-muted">GPT-4, Claude va boshqa modellar</p>
        </div>
        <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Yangi chat</Button>
      </div>

      <Card className="flex flex-1 flex-col p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUGGESTIONS.map((s) => (
                <button key={s.text} onClick={() => send(s.text)} className="rounded-xl border border-border p-3 text-left text-sm transition-all hover:border-brand-500 hover:bg-surface-2">
                  <div className="text-2xl">{s.icon}</div>
                  <p className="mt-1">{s.text}</p>
                </button>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-white"><Bot className="h-4 w-4" /></div>}
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-surface-2')}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === 'user' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2"><User className="h-4 w-4" /></div>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-500 text-white"><Bot className="h-4 w-4" /></div>
              <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Yozayotgan...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <button type="button" className="rounded-xl bg-surface-2 p-2.5 hover:bg-surface-3"><Paperclip className="h-4 w-4" /></button>
            <input
              value={input} onChange={(e) => setInput(e.target.value)} placeholder="Xabar yozing..."
              className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="button" className="rounded-xl bg-surface-2 p-2.5 hover:bg-surface-3"><Mic className="h-4 w-4" /></button>
            <Button type="submit" disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
