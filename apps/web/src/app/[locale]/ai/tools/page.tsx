'use client';
import { useState } from 'react';
import { Sparkles, Code, Lightbulb, Briefcase, FileText, PenTool, Mail, Languages, BarChart3, Globe, Image as ImageIcon, Database, Bug, GitBranch, FileCode, Languages as Translate, Megaphone, Target, Brain, Search, FileSearch, ArrowRight, Loader2, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TOOLS = [
  { id: 'startup-idea', icon: Lightbulb, title: 'Startup Idea', desc: 'Yangi biznes g\'oyalar', color: 'from-violet-500 to-purple-600', category: 'Biznes' },
  { id: 'business-plan', icon: Briefcase, title: 'Business Plan', desc: 'Biznes reja tuzish', color: 'from-pink-500 to-rose-600', category: 'Biznes' },
  { id: 'pitch-deck', icon: FileText, title: 'Pitch Deck', desc: 'Investorlar uchun prezentatsiya', color: 'from-red-500 to-pink-600', category: 'Biznes' },
  { id: 'resume', icon: FileText, title: 'Resume', desc: 'Professional resume yaratish', color: 'from-orange-500 to-amber-600', category: 'Karyera' },
  { id: 'cover-letter', icon: Mail, title: 'Cover Letter', desc: 'Motivatsion xat', color: 'from-yellow-500 to-orange-600', category: 'Karyera' },
  { id: 'job-description', icon: FileText, title: 'Job Description', desc: 'Vakansiya tavsifi', color: 'from-amber-500 to-yellow-600', category: 'Karyera' },
  { id: 'code', icon: Code, title: 'Code Generator', desc: 'Kod yozish va generatsiya', color: 'from-blue-500 to-cyan-600', category: 'Dasturlash' },
  { id: 'code-review', icon: GitBranch, title: 'Code Review', desc: 'Kod tahlili', color: 'from-cyan-500 to-blue-600', category: 'Dasturlash' },
  { id: 'bug-fix', icon: Bug, title: 'Bug Fix', desc: 'Xatolarni tuzatish', color: 'from-red-500 to-rose-600', category: 'Dasturlash' },
  { id: 'sql', icon: Database, title: 'SQL Generator', desc: 'SQL query yozish', color: 'from-indigo-500 to-violet-600', category: 'Dasturlash' },
  { id: 'api-docs', icon: FileCode, title: 'API Docs', desc: 'API hujjatlari', color: 'from-violet-500 to-indigo-600', category: 'Dasturlash' },
  { id: 'translate', icon: Translate, title: 'Tarjimon', desc: 'Matn tarjimasi', color: 'from-teal-500 to-cyan-600', category: 'Tillar' },
  { id: 'summarize', icon: FileSearch, title: 'Xulosa', desc: 'Matn qisqartirish', color: 'from-emerald-500 to-teal-600', category: 'Tillar' },
  { id: 'blog', icon: PenTool, title: 'Blog', desc: 'Blog maqolasi', color: 'from-green-500 to-emerald-600', category: 'Kontent' },
  { id: 'email', icon: Mail, title: 'Email', desc: 'Email yozish', color: 'from-rose-500 to-pink-600', category: 'Kontent' },
  { id: 'seo', icon: Search, title: 'SEO', desc: 'SEO optimallashtirish', color: 'from-lime-500 to-green-600', category: 'Marketing' },
  { id: 'marketing', icon: Megaphone, title: 'Marketing', desc: 'Marketing strategiya', color: 'from-fuchsia-500 to-pink-600', category: 'Marketing' },
  { id: 'brainstorm', icon: Brain, title: 'Brainstorm', desc: 'G\'oyalar generatsiyasi', color: 'from-purple-500 to-fuchsia-600', category: 'Kreativ' },
  { id: 'project-plan', icon: Target, title: 'Project Plan', desc: 'Loyiha rejasi', color: 'from-blue-500 to-indigo-600', category: 'Biznes' },
  { id: 'logo-prompt', icon: ImageIcon, title: 'Logo Prompt', desc: 'Logo uchun prompt', color: 'from-pink-500 to-rose-600', category: 'Dizayn' },
  { id: 'domain', icon: Globe, title: 'Domain', desc: 'Domain nomlari', color: 'from-sky-500 to-blue-600', category: 'Biznes' },
  { id: 'analyze-text', icon: BarChart3, title: 'Text Analyze', desc: 'Matn tahlili', color: 'from-amber-500 to-orange-600', category: 'Tillar' },
];

const CATEGORIES = ['Hammasi', 'Biznes', 'Karyera', 'Dasturlash', 'Kontent', 'Marketing', 'Tillar', 'Kreativ', 'Dizayn'];

export default function AIToolsPage() {
  const [selected, setSelected] = useState(TOOLS[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState('Hammasi');
  const [copied, setCopied] = useState(false);

  const filtered = cat === 'Hammasi' ? TOOLS : TOOLS.filter((t) => t.category === cat);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    setTimeout(() => {
      setOutput(`# ${selected.title} natijasi\n\nSizning so'rovingiz: "${input}"\n\nBu ${selected.title} vositasi yordamida tayyorlangan demo natija. Haqiqiy production'da bu yerda AI tomonidan generatsiya qilingan batafsil kontent ko'rsatiladi.\n\n## Asosiy natijalar:\n- 5 ta variant taklif qilindi\n- Har biri uchun tavsif berildi\n- Amaliy qo'llanma qo'shildi\n- 3-5 daqiqa vaqt ichida tayyor\n\nKeyingi qadamlar:\n1. Natijani ko'rib chiqing\n2. O'zgartirishlar kiriting\n3. Yuklab oling yoki ulashing`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">AI Vositalar ✨</h1>
        <p className="text-sm text-slate-500">{TOOLS.length}+ ta professional AI vositasi. Birini tanlang va ishni boshlang.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn('rounded-full px-4 py-1.5 text-sm transition-all', cat === c ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800')}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tools Grid */}
        <div className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {filtered.map((t) => (
              <button key={t.id} onClick={() => { setSelected(t); setOutput(''); setInput(''); }} className={cn('group flex items-center gap-3 rounded-xl border p-3 text-left transition-all', selected.id === t.id ? 'border-violet-500 bg-violet-500/5 shadow-lg' : 'border-slate-200 bg-white hover:border-violet-300 dark:border-slate-800 dark:bg-slate-900')}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white', t.color)}>
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.title}</p>
                  <p className="truncate text-xs text-slate-500">{t.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        {/* Working Area */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-start gap-3">
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white', selected.color)}>
                <selected.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{selected.title}</h2>
                <p className="text-sm text-slate-500">{selected.desc}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{selected.category}</span>
            </div>
          </Card>

          <Card>
            <label className="mb-2 block text-sm font-semibold">Sizning so'rovingiz</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} placeholder={`${selected.title} uchun batafsil ma'lumot kiriting...`} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">{input.length} belgi · ~{Math.max(1, Math.ceil(input.length / 4))} token</p>
              <Button onClick={generate} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Generatsiya qilish</>}
              </Button>
            </div>
          </Card>

          {output && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Natija</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <><Check className="h-3 w-3" /> Nusxalandi</> : <><Copy className="h-3 w-3" /> Nusxalash</>}
                  </Button>
                  <Button variant="ghost" size="sm"><Download className="h-3 w-3" /> Yuklab olish</Button>
                </div>
              </div>
              <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900">{output}</pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
