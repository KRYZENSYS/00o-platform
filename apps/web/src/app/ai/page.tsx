'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Lightbulb, Code, FileText, Languages, BookOpen, Mail, TrendingUp, Briefcase, Crown, Loader2, Plus, History, Trash2, Image, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatRelative, cn } from '@/lib/utils';

const TOOLS = [
  { id: 'startup-idea', l: '💡 Startup g\'oya', i: Lightbulb, cost: 10, desc: 'AI sizga 3 ta startup g\'oya taklif qiladi' },
  { id: 'business-plan', l: '📊 Biznes-plan', i: TrendingUp, cost: 20, desc: 'To\'liq biznes-reja yarating' },
  { id: 'code', l: '💻 Kod yozish', i: Code, cost: 5, desc: 'Har qanday tilda kod' },
  { id: 'translate', l: '🌐 Tarjima', i: Languages, cost: 2, desc: '50+ tilga tarjima' },
  { id: 'resume', l: '📝 Rezyume', i: FileText, cost: 10, desc: 'HR darajasidagi CV' },
  { id: 'blog', l: '✍️ Blog', i: BookOpen, cost: 8, desc: 'SEO maqola' },
  { id: 'email', l: '📧 Email', i: Mail, cost: 5, desc: 'Professional xat' },
  { id: 'pitch', l: '🎤 Pitch', i: Briefcase, cost: 15, desc: 'Investorlarga taqdimot' },
  { id: 'logo', l: '🎨 Logo g\'oya', i: Image, cost: 5, desc: 'Logotip konsepti' },
  { id: 'brand-name', l: '✨ Brend nomi', i: Wand2, cost: 5, desc: 'Kreativ nomlar' },
];

const MODELS = [
  { id: 'llama-3.3-70b-versatile', l: '🦙 Llama 3.3 70B', desc: 'Eng kuchli' },
  { id: 'qwen/qwen-2.5-coder-32b', l: '💻 Qwen Coder 32B', desc: 'Kod uchun' },
  { id: 'llama-3.1-8b-instant', l: '⚡ Llama 3.1 8B', desc: 'Tez' },
  { id: 'deepseek-r1-distill-llama-70b', l: '🧠 DeepSeek R1 70B', desc: 'Mantiq' },
];

export default function AIPage() {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'chat' | 'tools'>('chat');
  const [tool, setTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'chat') loadConversations();
  }, [mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.ai.conversations();
      setConversations(res.data || []);
    } catch (e) { /* ignore */ }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(m => [...m, userMsg]);
    const prompt = input;
    setInput('');
    setLoading(true);
    try {
      const res = await api.ai.chat([{ role: 'user', content: prompt }], 'chat', model);
      setMessages(m => [...m, { role: 'assistant', content: res.data.message }]);
      loadConversations();
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Xatolik: ' + (e.response?.data?.message || e.message) }]);
    } finally {
      setLoading(false);
    }
  };

  const useTool = async (toolId: string) => {
    if (!input.trim() || loading) return;
    setTool(toolId);
    setLoading(true);
    try {
      const res = await (api.ai.tools as any)[toolId.replace(/-/g, '')]({ prompt: input });
      setMessages(m => [...m, { role: 'user', content: `🔧 ${TOOLS.find(t => t.id === toolId)?.l}: ${input}` }, { role: 'assistant', content: res.data.result }]);
      setInput('');
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ ' + (e.response?.data?.message || e.message) }]);
    } finally {
      setLoading(false);
      setTool(null);
    }
  };

  const newChat = () => {
    setMessages([]);
    setActiveConv(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className={cn('w-72 border-r border-slate-200 dark:border-slate-800', showSidebar ? 'block' : 'hidden md:block')}>
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <Button onClick={newChat} variant="gradient" fullWidth><Plus className="h-4 w-4" /> Yangi chat</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {conversations.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">Hozircha suhbatlar yo'q</p>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className={cn('group flex cursor-pointer items-center gap-2 rounded-xl p-2 text-sm transition', activeConv === c.id ? 'bg-violet-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-900')}>
                  <History className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate text-xs">{c.title}</span>
                  <button onClick={async (e) => { e.stopPropagation(); await api.ai.deleteConversation(c.id); loadConversations(); }} className="opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
          {user && (
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-3">
                <div className="mb-1 flex items-center gap-1 text-xs font-semibold">
                  🪙 Tokenlar: {user.tokens || 0}
                </div>
                {!user.isPremium && (
                  <Button size="sm" variant="gradient" fullWidth className="mt-2">
                    <Crown className="h-3 w-3" /> Pro ga o'tish
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden">≡</button>
            <Sparkles className="h-5 w-5 text-violet-500" />
            <div>
              <h1 className="text-base font-bold">AI Yordamchi</h1>
              <p className="text-xs text-slate-500">GroqCloud · Llama 3.3 70B</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={model} onChange={(e) => setModel(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-800 dark:bg-slate-900">
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.l}</option>)}
            </select>
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
              <button onClick={() => setMode('chat')} className={cn('rounded-md px-2 py-1 text-xs', mode === 'chat' ? 'bg-violet-500 text-white' : '')}>💬 Chat</button>
              <button onClick={() => setMode('tools')} className={cn('rounded-md px-2 py-1 text-xs', mode === 'tools' ? 'bg-violet-500 text-white' : '')}>🛠 Vositalar</button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <div className="mb-3 text-5xl">🤖</div>
                <h2 className="mb-1 text-xl font-bold">Salom, {user?.firstName || 'foydalanuvchi'}!</h2>
                <p className="mb-6 text-sm text-slate-500">Sizga qanday yordam bera olaman?</p>
                {mode === 'chat' ? (
                  <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
                    {['💡 Startup g\'oya ber', '📊 Marketing strategiya', '💻 Python kod yoz', '📝 Rezyume tuzib ber'].map((s) => (
                      <button key={s} onClick={() => setInput(s)} className="card p-3 text-left text-xs transition hover:shadow">{s}</button>
                    ))}
                  </div>
                ) : (
                  <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 md:grid-cols-3">
                    {TOOLS.map((t) => (
                      <button key={t.id} onClick={() => { setTool(t.id); }} className="card p-3 text-left text-xs transition hover:shadow-md">
                        <p className="mb-1 font-semibold">{t.l}</p>
                        <p className="text-[10px] text-slate-500">{t.desc}</p>
                        <p className="mt-1 text-[10px] font-bold text-violet-500">{t.cost} 🪙</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', m.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900')}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }} />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-3xl">
            {mode === 'tools' && tool && (
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span>Tanlangan:</span>
                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 font-semibold text-violet-500">{TOOLS.find(t => t.id === tool)?.l}</span>
                <button onClick={() => setTool(null)} className="text-slate-500">×</button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mode === 'chat' ? send() : (tool ? useTool(tool) : null); }
                }}
                placeholder={mode === 'chat' ? 'Savolingizni yozing...' : tool ? `${TOOLS.find(t => t.id === tool)?.l} uchun so'rov...` : 'Avval vositani tanlang'}
                rows={1}
                disabled={loading}
                className="min-h-[44px] resize-none"
              />
              <Button onClick={mode === 'chat' ? send : () => tool && useTool(tool)} variant="gradient" size="icon" disabled={!input.trim() || loading || (mode === 'tools' && !tool)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[a-z])/gim, '<p>')
    .replace(/$(?![<a-z])/gim, '</p>');
}
