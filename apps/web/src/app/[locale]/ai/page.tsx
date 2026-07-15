'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Plus, MessageSquare, Trash2, Settings2, Zap, Code2, Lightbulb, FileText, Briefcase, Image as ImageIcon, Languages, BarChart3, PenTool, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message { id: string; role: 'user' | 'assistant'; content: string; createdAt: string; }

const QUICK_TOOLS = [
  { icon: Lightbulb, label: 'Startup idea', color: 'from-violet-500 to-purple-600', prompt: 'Menga 5 ta yangi startup g\'oya taklif qil, IT sohasida' },
  { icon: Briefcase, label: 'Business plan', color: 'from-pink-500 to-rose-600', prompt: 'AI asosida startup uchun batafsil biznes reja tuz' },
  { icon: Code2, label: 'Code yozish', color: 'from-blue-500 to-cyan-600', prompt: 'Python da REST API yoz' },
  { icon: FileText, label: 'Resume', color: 'from-orange-500 to-amber-600', prompt: 'Menga professional resume yarat' },
  { icon: PenTool, label: 'Blog maqola', color: 'from-green-500 to-emerald-600', prompt: 'AI haqida 1500 so\'zlik blog maqola yoz' },
  { icon: Mail, label: 'Email', color: 'from-red-500 to-pink-600', prompt: 'Professional email yoz' },
  { icon: Languages, label: 'Tarjima', color: 'from-indigo-500 to-violet-600', prompt: 'Bu matnni ingliz tiliga tarjima qil' },
  { icon: BarChart3, label: 'Marketing', color: 'from-fuchsia-500 to-pink-600', prompt: 'Marketing strategiya tuzib ber' },
  { icon: Globe, label: 'Domain', color: 'from-teal-500 to-cyan-600', prompt: 'Yangi startup uchun domain nomlari taklif qil' },
  { icon: ImageIcon, label: 'Logo prompt', color: 'from-amber-500 to-orange-600', prompt: 'AI image generator uchun logo prompt yoz' },
];

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', badge: 'Default' },
  { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder', badge: 'Code' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1', badge: 'Reasoning' },
  { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', badge: 'Fast' },
];

const DEMO_RESPONSES = [
  "💡 **5 ta yangi startup g'oya (IT sohasida):**\n\n1. **AI Study Buddy** — O'zbek tilida talabalar uchun shaxsiy AI repetitor, matn va video orqali dars beradi.\n\n2. **FreelanceHub** — O'zbek frilanserlari uchun marketplace, AI portfolio builder va xizmat narxini aniqlovchi.\n\n3. **Telegram CRM** — Kichik biznes uchun Telegram bot orqali mijozlar boshqaruvi tizimi.\n\n4. **EdTech VR** — VR orqali o'qitish platformasi, maktablar uchun interaktiv darslar.\n\n5. **AgriTech AI** — Dehqonchilik uchun AI monitoring, hosil bashorati va sug'orishni optimallashtirish.\n\nHar birining MVP sini 1-2 oy ichida yaratish mumkin. Qaysi biri qiziqroq?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Salom! Men 00o.uz AI yordamchisiman. Sizga qanday yordam bera olaman? Startap g\'oya, kod yozish, biznes reja, tarjima yoki boshqa narsa kerakmi?', createdAt: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)], createdAt: new Date().toISOString() };
      setMessages((m) => [...m, aiMsg]);
      setLoading(false);
    }, 1500);
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat List Sidebar */}
      <div className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 lg:block">
        <Button className="mb-4 w-full justify-start" size="sm"><Plus className="h-4 w-4" /> Yangi chat</Button>
        <div className="space-y-1">
          {['Startup idea generator', 'Business plan', 'Code review', 'Resume yaratish', 'Logo prompt', 'Marketing strategy'].map((c, i) => (
            <button key={i} className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="flex-1 truncate">{c}</span>
              <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
        <div className="mt-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Tezkor vositalar</p>
          <div className="space-y-1">
            {QUICK_TOOLS.slice(0, 6).map((t) => (
              <button key={t.label} onClick={() => send(t.prompt)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-white', t.color)}>
                  <t.icon className="h-3 w-3" />
                </div>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white/50 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">00o.uz AI</h2>
              <p className="text-xs text-slate-500">{model.name} · {messages.length - 1} xabar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={model.id} onChange={(e) => setModel(MODELS.find((m) => m.id === e.target.value)!)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900">
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <Button variant="ghost" size="icon"><Settings2 className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 1 && (
              <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {QUICK_TOOLS.map((t) => (
                  <button key={t.label} onClick={() => send(t.prompt)} className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-violet-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white', t.color)}>
                      <t.icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.prompt.slice(0, 40)}...</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', m.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-gradient-to-br from-violet-500 to-pink-500 text-white')}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn('group max-w-[80%] rounded-2xl px-4 py-3', m.role === 'user' ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-900')}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                  {m.role === 'assistant' && (
                    <div className="mt-3 flex items-center gap-1 border-t border-slate-200/50 pt-2 opacity-0 transition-opacity group-hover:opacity-100 dark:border-slate-700">
                      <button onClick={() => copy(m.content, m.id)} className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800">
                        {copiedId === m.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800"><RefreshCw className="h-3 w-3" /></button>
                      <button className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800"><ThumbsUp className="h-3 w-3" /></button>
                      <button className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-800"><ThumbsDown className="h-3 w-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white"><Bot className="h-4 w-4" /></div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white/50 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Savolingizni yozing... (Enter - yuborish, Shift+Enter - yangi qator)" rows={1} className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
              <button onClick={() => send()} disabled={loading || !input.trim()} className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 transition-all hover:scale-105 disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">AI xatolar qilishi mumkin. Muhim ma'lumotlarni tekshiring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
