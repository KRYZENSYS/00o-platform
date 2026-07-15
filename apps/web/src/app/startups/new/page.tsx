'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

const STAGES = [
  { value: 'idea', label: '💡 G\'oya' },
  { value: 'mvp', label: '🛠 MVP' },
  { value: 'beta', label: '🧪 Beta' },
  { value: 'launched', label: '🚀 Launched' },
  { value: 'growth', label: '📈 Growth' },
  { value: 'scale', label: '🌍 Scale' },
];

const CATEGORIES = ['EdTech', 'FinTech', 'HealthTech', 'E-commerce', 'AI', 'SaaS', 'Marketplace', 'Logistics', 'AgriTech', 'Travel', 'Food', 'Gaming', 'Other'];

export default function NewStartupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', stage: 'idea', category: 'EdTech',
    website: '', email: '', phone: '', location: 'Tashkent, Uzbekistan',
    fundingGoal: 0, currency: 'USD', tags: '', logo: '', coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const generateWithAI = async () => {
    if (!form.name) {
      setError('Avval startap nomini kiriting');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.ai.tools.startupIdea({ industry: form.category, budget: `${form.fundingGoal} ${form.currency}` });
      if (res.data?.result) update('description', res.data.result);
    } catch (e) { /* ignore */ }
    setAiLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const res = await api.startups.create(payload);
      router.push(`/startups/${res.data.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Link href="/startups" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Startaplarga qaytish
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-white">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Yangi startap</h1>
            <p className="text-sm text-slate-500">G'oyangizni dunyoga taqdim eting</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label required>Startap nomi</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Masalan: EduTech AI Tutor" required minLength={3} maxLength={60} />
          </div>

          <div>
            <Label required>Tagline (qisqa tavsif)</Label>
            <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Bir jumla bilan nima qiladi" required maxLength={120} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Batafsil tavsif</Label>
              <Button type="button" size="sm" variant="ghost" onClick={generateWithAI} loading={aiLoading}>
                <Sparkles className="h-3.5 w-3.5" /> AI bilan to'ldirish
              </Button>
            </div>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Startap nima qiladi, kim uchun, qanday muammoni hal qiladi..." rows={5} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Bosqich</Label>
              <select value={form.stage} onChange={(e) => update('stage', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Soha</Label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Mablag' maqsadi</Label>
              <div className="flex gap-2">
                <Input type="number" min="0" value={form.fundingGoal} onChange={(e) => update('fundingGoal', Number(e.target.value))} placeholder="50000" />
                <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                  <option>USD</option>
                  <option>UZS</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Joylashuv</Label>
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Tashkent, Uzbekistan" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Website</Label>
              <Input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://example.com" />
            </div>
            <div>
              <Label>Aloqa email</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="contact@startap.com" />
            </div>
          </div>

          <div>
            <Label>Teglar (vergul bilan ajrating)</Label>
            <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="ai, education, uzbekistan, saas" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Logo URL</Label>
              <Input value={form.logo} onChange={(e) => update('logo', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Cover image URL</Label>
              <Input value={form.coverImage} onChange={(e) => update('coverImage', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Link href="/startups" className="flex-1"><Button type="button" variant="outline" fullWidth>Bekor qilish</Button></Link>
            <Button type="submit" variant="gradient" loading={loading} fullWidth>
              <Save className="h-4 w-4" /> Yaratish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
