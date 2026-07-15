'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Bot, User, Loader2, Wand2, Code, FileText, Globe, MessageCircle, Crown, TrendingUp, Briefcase, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type Msg = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };

const TOOLS = [
  { id: 'idea', label: 'G\'oya', icon: Sparkles, color: 'text-violet-500', prompt: 'Menga innovatsion, amaliy startap g\'oyasi taklif qil. Muammo, yechim, bozor va monetizatsiya modelini yoz.' },
  { id: 'business', label: 'Biznes-plan', icon: TrendingUp, color: 'text-pink-500', prompt: 'To\'liq biznes-plan yoz: xulosa, muammo, yechim, bozor tahlili, marketing, moliyaviy prognoz.' },
  { id: 'code', label: 'Kod', icon: Code, color: 'text-blue-500', prompt: '' },
  { id: 'resume', label: 'Rezyume', icon: FileText, color: 'text-green-500', prompt: 'Professional rezyume yoz. Faoliyat, ko\'nikmalar, ta\'lim, tajriba.' },
  { id: 'translate', label: 'Tarjima', icon: Globe, color: 'text-orange-500', prompt: 'Matnni tarjima qil: ' },
  { id: 'blog', label: 'Blog', icon: FileText, color: 'text-red-500', prompt: 'SEO-optimallashtirilgan blog maqola yoz. Sarlavha, kirish, 3-5 bo\'lim, xulosa.' },
  { id: 'email', label: 'Email', icon: MessageCircle, color: 'text-cyan-500', prompt: 'Professional email yoz. Qisqa, aniq, samimiy.' },
  { id: 'pitch', label: 'Pitch', icon: Crown, color: 'text-amber-500', prompt: 'Investor uchun 2 daqiqalik pitch yoz.' },
];

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', tag: '⭐ Best' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', tag: '⚡ Tezkor' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', tag: '🧠 Uzoq' },
  { id: 'gemma2-9b-it', label: 'Gemma 2 9B', tag: '💎 Yengil' },
  { id: 'llama-3.2-3b-preview', label: 'Llama 3.2 3B', tag: '🚀 Free' },
];

export default function AIChatPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.ai.conversations().then((r) => {
      const list = r.data?.items || r.data || [];
      if (list.length > 0) {
        setConvId(list[0].id);
        setMessages(list[0].messages || []);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput(''); setLoading(true);

    const aiMsg: Msg = { id: String(Date.now() + 1), role: 'assistant', content: '', created_at: new Date().toISOString() };
    setMessages((m) => [...m, aiMsg]);

    try {
      const r = await api.ai.complete({
        prompt: content,
        model,
        conversation_id: convId || undefined,
        stream: false,
      });
      const result = r.data?.text || r.data?.content || r.data?.result || r.data?.message || 'Kechirasiz, javob bera olmadim.';
      if (r.data?.conversation_id) setConvId(r.data.conversation_id);
      setMessages((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, content: result } : x)));
    } catch (e: any) {
      setMessages((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, content: '⚠️ Xatolik: ' + (e?.response?.data?.detail || 'Server bilan bog\'lanib bo\'lmadi') } : x)));
    } finally { setLoading(false); }
  };

  const newChat = () => {
    setMessages([]); setConvId(null);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <Sparkles className="h-6 w-6 text-violet-500" /> AI Chat
          </h1>
          <p className="text-sm text-slate-500">GroqCloud · {user?.tokens ?? 0} 🪙 qoldi</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={model} onChange={(e) => setModel(e.target.value)} className="input max-w-[180px] text-xs">
            {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label} {m.tag}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={newChat}><Plus className="h-4 w-4" /> Yangi</Button>
        </div>
      </div>

      {/* Tools quick */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => t.prompt && send(t.prompt)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-violet-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <t.icon className={cn('h-3.5 w-3.5', t.color)} /> {t.label}
          </button>
        ))}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-xl">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black">Salom! Men 00o AIman 🤖</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">G\'oya, kod, tarjima, biznes-plan — hamma narsada yordam beraman. Yuqoridagi vositalardan tanlang yoki savol bering!</p>
              <div className="mt-4 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { t: '💡 Startap g\'oyasi', p: 'EdTech yo\'nalishida innovatsion startap g\'oyasi taklif qil' },
                  { t: '📊 Biznes-plan', p: 'AI asosida marketing agentligi uchun biznes-plan yoz' },
                  { t: '💻 Kod yordam', p: 'Next.js va FastAPI yordamida real-time chat qanday qilaman?' },
                  { t: '✍️ Blog maqola', p: 'AI startup ekotizimi haqida SEO blog yoz' },
                ].map((s) => (
                  <button key={s.t} onClick={() => send(s.p)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-sm transition hover:border-violet-300 dark:border-slate-800 dark:bg-slate-900">
                    <div className="font-bold">{s.t}</div>
                    <div className="text-xs text-slate-500">{s.p}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', m.role === 'user' ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-900')}>
                {m.content ? <div className="whitespace-pre-wrap break-words">{m.content}</div> : <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {m.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Savol yozing..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900"
            disabled={loading}
          />
          <Button type="submit" variant="gradient" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
