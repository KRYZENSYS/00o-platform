'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket, Save, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import api from '@/lib/api';

export default function NewStartupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', industry: '', stage: 'idea',
    location: 'Tashkent', website_url: '', funding_goal: 0, team_size: 1, tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const suggest = async () => {
    if (!form.name) { setErr('Avval nom kiriting'); return; }
    setAiLoading(true); setErr('');
    try {
      const r = await api.ai.complete({ prompt: `Startup: ${form.name}, Industry: ${form.industry}. Generate 1 catchy tagline (max 80 chars) and 1 short description (max 200 chars) in Uzbek. Format: TAGLINE: ... | DESC: ...` });
      const text = r.data?.text || r.data?.content || r.data?.result || '';
      const m = text.match(/TAGLINE:\s*(.+?)\s*\|\s*DESC:\s*(.+)/is);
      if (m) setForm({ ...form, tagline: m[1].trim(), description: m[2].trim() });
      else setForm({ ...form, tagline: text.slice(0, 80) });
    } catch { setErr('AI xizmati vaqtincha mavjud emas'); }
    finally { setAiLoading(false); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const r = await api.startups.create(payload);
      const id = r.data?.id || r.data?.data?.id;
      router.push(id ? `/startups/${id}` : '/startups');
    } catch (e: any) { setErr(e?.response?.data?.detail || 'Xatolik yuz berdi'); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/startups" className="rounded-xl border border-slate-200 p-2 dark:border-slate-800"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-2xl font-black">Yangi startap</h1>
          <p className="text-sm text-slate-500">G\'oyangizni dunyoga tanishtiring</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Asosiy ma\'lumot</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label required>Nomi</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required placeholder="Masalan: EduAI" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Soha</Label>
                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input">
                  <option value="">Tanlang</option>
                  {['EdTech', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI/ML', 'Logistics', 'Agritech', 'MedTech', 'Gaming', 'Other'].map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>Bosqich</Label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="input">
                  <option value="idea">💡 G\'oya</option>
                  <option value="mvp">🚀 MVP</option>
                  <option value="growth">📈 O\'sish</option>
                  <option value="scaling">🌍 Masshtablash</option>
                </select>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label>Tagline</Label>
                <button type="button" onClick={suggest} disabled={aiLoading} className="text-xs text-violet-500 hover:underline disabled:opacity-50">
                  <Sparkles className="mr-1 inline h-3 w-3" /> {aiLoading ? 'Yuklanmoqda...' : 'AI yordam'}
                </button>
              </div>
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} maxLength={120} placeholder="Qisqa ta\'rif" />
            </div>
            <div>
              <Label>Batafsil tavsif</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} maxLength={2000} placeholder="Startapingiz nima qiladi..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Qo\'shimcha</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Joylashuv</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Toshkent" /></div>
              <div><Label>Website</Label><Input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Jamoa hajmi</Label><Input type="number" min={1} max={100} value={form.team_size} onChange={(e) => setForm({ ...form, team_size: +e.target.value })} /></div>
              <div><Label>Funding maqsad ($)</Label><Input type="number" min={0} value={form.funding_goal} onChange={(e) => setForm({ ...form, funding_goal: +e.target.value })} placeholder="50000" /></div>
            </div>
            <div>
              <Label>Teglar (vergul bilan)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="ai, education, mobile" />
            </div>
          </CardContent>
        </Card>

        {err && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{err}</div>}

        <div className="flex justify-end gap-2">
          <Link href="/startups"><Button type="button" variant="outline">Bekor qilish</Button></Link>
          <Button type="submit" variant="gradient" loading={loading}><Save className="h-4 w-4" /> Saqlash</Button>
        </div>
      </form>
    </div>
  );
}
