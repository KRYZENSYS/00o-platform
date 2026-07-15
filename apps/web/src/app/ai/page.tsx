'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Loader2, Bot, User as UserIcon, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { cn, formatRelative } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokensUsed?: number;
  createdAt?: string;
}

const SUGGESTIONS = [
  { i: '💡', t: 'Menga AI startup g\'oya ber', p: 'O\'zbekiston bozorida AI startup g\'oya taklif qil. Byudjet 100M so\'m.' },
  { i: '📊', t: 'Biznes-plan tuz', p: 'EdTech platforma uchun batafsil biznes-plan yoz.' },
  { i: '💻', t: 'React komponent yoz', p: 'Next.js 15 da to\'liq responsive navbar komponent yozib ber.' },
  { i: '📝', t: 'Rezyume yoz', p: 'Frontend dasturchi uchun professional rezyume yoz. 3 yil tajriba.' },
  { i: '🌐', t: 'Tarjima qil', p: 'Quyidagi matnni ingliz tiliga tarjima qil: ...' },
  { i: '✍️', t: 'Blog maqola', p: 'AI va kelajak haqida SEO-optimallashtirilgan blog maqola yoz.' },
  { i: '🎯', t: 'Pitch deck', p: 'Investorlarga mo\'ljallangan 5 daqiqalik pitch yarating.' },
  { i: '📈', t: 'Marketing strategiya', p: 'Yangi SaaS mahsulot uchun marketing strategiyasi.' },
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [showModels, setShowModels] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Tez va kuchli' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: 'Eng tez' },
    { id: 'qwen-2.5-coder-32b', name: 'Qwen Coder 32B', desc: 'Kod uchun' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1', desc: 'Mantiqiy' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Multilingual' },
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ai.chat([{ role: 'user', content }], 'chat', model);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data?.content || 'Xatolik yuz berdi',
        model: res.data?.model,
        tokensUsed: res.data?.tokens,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch (err: any) {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ ' + (err.response?.data?.message || err.message || 'Xatolik yuz berdi'),
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const currentModel = MODELS.find(m => m.id === model) || MODELS[0];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Chat</h1>
            <p className="text-xs text-slate-500">GroqCloud bilan ishlaydi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowModels(!showModels)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" /> {currentModel.name}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showModels && (
              <div className="absolute right-0 top-10 z-10 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {MODELS.map((m) => (
                  <button key={m.id} onClick={() => { setModel(m.id); setShowModels(false); }} className={cn('w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900', model === m.id && 'bg-violet-500/10')}>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setMessages([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-3xl">🤖</div>
              <h2 className="mb-2 text-2xl font-bold">Salom! Men sizning AI yordamchingizman</h2>
              <p className="text-slate-500">G'oyalar, kod, biznes-plan, kontent - hammasi uchun</p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-500">Boshlang'ich savollar:</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s.t} onClick={() => send(s.p)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-violet-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-1 text-2xl">{s.i}</div>
                    <div className="text-sm font-semibold">{s.t}</div>
                    <div className="mt-1 text-xs text-slate-500 line-clamp-1">{s.p}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div className={cn('max-w-[85%]', m.role === 'user' ? 'order-1' : '')}>
                  <div className={cn('rounded-2xl px-4 py-3', m.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900')}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-1 text-[10px] text-slate-500">
                    {m.model && <span>• {m.model}</span>}
                    {m.tokensUsed !== undefined && <span>• {m.tokensUsed} tokens</span>}
                    {m.createdAt && <span>• {formatRelative(m.createdAt)}</span>}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Yozayapman...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-violet-500 dark:border-slate-800 dark:bg-slate-900">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Savolingizni yozing... (Enter - yuborish, Shift+Enter - yangi qator)"
              rows={1}
              className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 pr-12 text-sm outline-none placeholder:text-slate-400"
            />
            <Button onClick={() => send()} disabled={!input.trim() || loading} size="icon" variant="gradient" className="absolute bottom-2 right-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-500">
            AI xatolari bo'lishi mumkin. Muhim ma'lumotlarni tekshiring.
          </p>
        </div>
      </div>
    </div>
  );
}
