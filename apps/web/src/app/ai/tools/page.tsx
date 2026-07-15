'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Copy, Check, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const TOOLS = [
  { id: 'startup-idea', i: '💡', name: 'Startup g\'oya', desc: 'Innovatsion startup g\'oyalar', fields: [{ k: 'industry', l: 'Soha', ph: 'EdTech, FinTech...' }, { k: 'budget', l: 'Byudjet', ph: '100M so\'m' }] },
  { id: 'business-plan', i: '📊', name: 'Biznes-plan', desc: 'To\'liq biznes-plan yaratish', fields: [{ k: 'idea', l: 'G\'oya tavsifi', ph: 'Startup g\'oyangiz', textarea: true }] },
  { id: 'code', i: '💻', name: 'Kod yozish', desc: 'Har qanday tilda kod', fields: [{ k: 'task', l: 'Vazifa', ph: 'Kod nima qilishi kerak', textarea: true }] },
  { id: 'code-review', i: '🔍', name: 'Kod tekshirish', desc: 'Kodni tahlil qilish', fields: [{ k: 'code', l: 'Kod', ph: 'Kodni shu yerga joylashtiring', textarea: true }] },
  { id: 'resume', i: '📝', name: 'Rezyume', desc: 'Professional CV yaratish', fields: [{ k: 'experience', l: 'Tajriba', ph: '3 yil frontend, React, Next.js', textarea: true }] },
  { id: 'cover-letter', i: '✉️', name: 'Cover letter', desc: 'Ish uchun ariza xati', fields: [{ k: 'position', l: 'Lavozim', ph: 'Senior Developer' }, { k: 'company', l: 'Kompaniya', ph: 'Google' }] },
  { id: 'translate', i: '🌐', name: 'Tarjima', desc: '60+ tilga tarjima', fields: [{ k: 'text', l: 'Matn', ph: 'Tarjima qilish...', textarea: true }, { k: 'to', l: 'Tilga', ph: 'en, ru, uz' }] },
  { id: 'blog', i: '📰', name: 'Blog maqola', desc: 'SEO maqola yozish', fields: [{ k: 'topic', l: 'Mavzu', ph: 'AI va kelajak', textarea: true }] },
  { id: 'social', i: '📱', name: 'Ijtimoiy post', desc: 'Engaging social media post', fields: [{ k: 'topic', l: 'Mavzu', ph: 'Mahsulot launch haqida', textarea: true }] },
  { id: 'email', i: '📧', name: 'Email', desc: 'Professional xat yozish', fields: [{ k: 'purpose', l: 'Maqsad', ph: 'Mijozga taklif', textarea: true }] },
  { id: 'summarize', i: '📋', name: 'Xulosa', desc: 'Matnni qisqartirish', fields: [{ k: 'text', l: 'Matn', ph: 'Uzun matn...', textarea: true }] },
  { id: 'pitch', i: '🎯', name: 'Pitch deck', desc: 'Investor pitch', fields: [{ k: 'startup', l: 'Startap', ph: 'Startup tavsifi', textarea: true }] },
  { id: 'market-research', i: '📈', name: 'Bozor tadqiqi', desc: 'Market analysis', fields: [{ k: 'market', l: 'Bozor', ph: 'O\'zbekiston EdTech', textarea: true }] },
  { id: 'financial-model', i: '💰', name: 'Moliyaviy model', desc: '3 yillik prognoz', fields: [{ k: 'business', l: 'Biznes', ph: 'SaaS platforma', textarea: true }] },
  { id: 'legal', i: '⚖️', name: 'Yuridik', desc: 'Shartnoma va hujjatlar', fields: [{ k: 'doc', l: 'Hujjat turi', ph: 'Xizmat ko\'rsatish shartnomasi', textarea: true }] },
  { id: 'brand-name', i: '✨', name: 'Brend nomi', desc: 'Kreativ nomlar', fields: [{ k: 'business', l: 'Biznes', ph: 'AI tutor platforma' }] },
  { id: 'logo', i: '🎨', name: 'Logo konsepsiyasi', desc: 'Logo tavsifi', fields: [{ k: 'brand', l: 'Brend', ph: 'Brend nomi va tavsifi', textarea: true }] },
];

function AIToolsContent() {
  const params = useSearchParams();
  const initialTool = params.get('tool') || 'startup-idea';
  const [active, setActive] = useState(initialTool);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const tool = TOOLS.find(t => t.id === initialTool);
    if (tool) setActive(initialTool);
  }, [initialTool]);

  const tool = TOOLS.find(t => t.id === active);

  const run = async () => {
    if (!tool) return;
    setLoading(true);
    setResult('');
    try {
      let res: any;
      const prompt = Object.values(inputs).filter(Boolean).join('\n');
      const context = inputs;
      switch (active) {
        case 'translate': {
          const t = inputs.to || 'en';
          res = await api.ai.tools.translate(inputs.text || '', 'uz', t);
          break;
        }
        default:
          res = await (api.ai.tools as any)[active]({ prompt, context });
      }
      setResult(res.data?.result || 'Natija yo\'q');
    } catch (e: any) {
      setResult('❌ Xatolik: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <Zap className="h-6 w-6 text-violet-500" /> AI Vositalar
        </h1>
        <p className="mt-1 text-sm text-slate-500">20+ maxsus AI vosita - har bir vazifangiz uchun</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tool list */}
        <div className="space-y-2 lg:col-span-1">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setActive(t.id); setResult(''); }} className={cn('w-full rounded-2xl border p-3 text-left transition-all', active === t.id ? 'border-violet-500 bg-violet-500/5' : 'border-slate-200 bg-white hover:border-violet-500/50 dark:border-slate-800 dark:bg-slate-900')}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{t.i}</div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tool UI */}
        <div className="space-y-4 lg:col-span-2">
          {tool && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="text-3xl">{tool.i}</div>
                <div>
                  <h2 className="text-xl font-bold">{tool.name}</h2>
                  <p className="text-sm text-slate-500">{tool.desc}</p>
                </div>
              </div>

              <div className="space-y-3">
                {tool.fields.map(f => (
                  <div key={f.k}>
                    <Label>{f.l}</Label>
                    {f.textarea ? (
                      <Textarea value={inputs[f.k] || ''} onChange={(e) => setInputs({ ...inputs, [f.k]: e.target.value })} placeholder={f.ph} rows={4} />
                    ) : (
                      <Input value={inputs[f.k] || ''} onChange={(e) => setInputs({ ...inputs, [f.k]: e.target.value })} placeholder={f.ph} />
                    )}
                  </div>
                ))}

                <Button onClick={run} variant="gradient" loading={loading} fullWidth>
                  {loading ? 'Yaratilmoqda...' : <><Sparkles className="h-4 w-4" /> Yaratish</>}
                </Button>
              </div>

              {result && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Natija:</span>
                    <Button size="sm" variant="ghost" onClick={copy}>
                      {copied ? <><Check className="h-3.5 w-3.5" /> Nusxalandi</> : <><Copy className="h-3.5 w-3.5" /> Nusxalash</>}
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIToolsPage() {
  return <Suspense fallback={<div className="p-6">Yuklanmoqda...</div>}><AIToolsContent /></Suspense>;
}
