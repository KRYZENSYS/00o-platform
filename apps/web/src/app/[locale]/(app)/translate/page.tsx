'use client';
import { useState } from 'react';
import { Languages, ArrowRight, Copy, Volume2, BookOpen, Mic } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
  { code: 'kg', name: 'Кыргызча', flag: '🇰🇬' },
  { code: 'tj', name: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function TranslatePage() {
  const [from, setFrom] = useState('uz');
  const [to, setTo] = useState('en');
  const [text, setText] = useState('Salom, dunyo! Bugun ajoyib kun.');
  const [loading, setLoading] = useState(false);

  const swap = () => { setFrom(to); setTo(from); };
  const translate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tarjimon</h1>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
          <button onClick={swap} className="rounded-xl bg-surface-2 p-2.5 transition-all hover:rotate-180 hover:bg-brand-500/20">
            <ArrowRight className="h-4 w-4" />
          </button>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Matn kiriting..." />
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span>{text.length} belgi</span>
              <button className="flex items-center gap-1 hover:text-brand-500"><Mic className="h-3 w-3" /> Ovoz</button>
            </div>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="whitespace-pre-wrap text-sm">Hello, world! Today is a wonderful day.</p>
            <div className="mt-3 flex justify-end gap-2">
              <button className="rounded-lg p-1.5 hover:bg-surface-3"><Volume2 className="h-3.5 w-3.5" /></button>
              <button className="rounded-lg p-1.5 hover:bg-surface-3"><Copy className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        <Button className="mt-4 w-full" onClick={translate} loading={loading} size="lg">
          <Languages className="h-4 w-4" /> Tarjima qilish
        </Button>
      </Card>

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" /> Tez-tez ishlatiladigan iboralar</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { uz: 'Salom', en: 'Hello' },
            { uz: 'Rahmat', en: 'Thank you' },
            { uz: 'Xayr', en: 'Goodbye' },
            { uz: 'Iltimos', en: 'Please' },
            { uz: 'Ha', en: 'Yes' },
            { uz: 'Yo\'q', en: 'No' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-surface-2 p-2 text-sm">
              <span>{p.uz}</span>
              <span className="text-text-muted">→</span>
              <span className="font-semibold">{p.en}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
