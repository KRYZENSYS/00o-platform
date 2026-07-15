'use client';
import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, Building2, Filter, Search, Plus, Heart, Bookmark, TrendingUp, Sparkles, Code, Palette, BarChart3, Megaphone, Heart as HeartIcon, Calculator, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const JOBS = [
  { id: '1', title: 'Senior Full-Stack Developer', company: '00o.uz', logo: '∞', location: 'Toshkent', remote: true, type: 'Full-time', salary: '15-25M so\'m', category: 'IT', tags: ['Next.js', 'Python', 'PostgreSQL'], experience: '5+ yil', applicants: 45, posted: '2 kun', urgent: true, description: 'AI platformamiz uchun senior full-stack dasturchi kerak. Next.js, FastAPI, PostgreSQL.' },
  { id: '2', title: 'AI/ML Engineer', company: 'TechCorp', logo: '🚀', location: 'Toshkent', remote: true, type: 'Full-time', salary: '20-30M so\'m', category: 'IT', tags: ['Python', 'TensorFlow', 'LLM'], experience: '3+ yil', applicants: 28, posted: '1 kun', urgent: false, description: 'LLM modellari bilan ishlash, AI agents yaratish. GroqCloud, OpenAI tajribasi.' },
  { id: '3', title: 'UI/UX Designer', company: 'DesignStudio', logo: '🎨', location: 'Samarqand', remote: true, type: 'Full-time', salary: '8-15M so\'m', category: 'Dizayn', tags: ['Figma', 'UI/UX', 'Design System'], experience: '3+ yil', applicants: 67, posted: '3 kun', urgent: false, description: 'Mobile va web ilovalar uchun zamonaviy dizayn. Figma, prototyping.' },
  { id: '4', title: 'Digital Marketing Manager', company: 'MarketingPro', logo: '📢', location: 'Toshkent', remote: false, type: 'Full-time', salary: '10-18M so\'m', category: 'Marketing', tags: ['SMM', 'SEO', 'Ads'], experience: '4+ yil', applicants: 34, posted: '5 kun', urgent: false, description: 'Digital marketing strategiyasi, SMM, reklama kampaniyalari boshqaruvi.' },
  { id: '5', title: 'DevOps Engineer', company: 'CloudTech', logo: '☁️', location: 'Remote', remote: true, type: 'Full-time', salary: '18-28M so\'m', category: 'IT', tags: ['Docker', 'K8s', 'AWS'], experience: '4+ yil', applicants: 19, posted: '1 hafta', urgent: true, description: 'CI/CD, Kubernetes, AWS, monitoring. Katta loyihalarda tajriba.' },
  { id: '6', title: 'Mobile Developer (Flutter)', company: 'AppMakers', logo: '📱', location: 'Toshkent', remote: true, type: 'Contract', salary: '12-20M so\'m', category: 'IT', tags: ['Flutter', 'Dart', 'Firebase'], experience: '2+ yil', applicants: 52, posted: '4 kun', urgent: false, description: 'iOS va Android uchun Flutter ilovalar. Firebase integratsiya.' },
  { id: '7', title: 'Content Writer (Uzbek)', company: '00o.uz', logo: '∞', location: 'Remote', remote: true, type: 'Part-time', salary: '5-8M so\'m', category: 'Kontent', tags: ['Copywriting', 'Uzbek', 'SEO'], experience: '2+ yil', applicants: 89, posted: '6 soat', urgent: false, description: 'O\'zbek tilida blog maqolalari, SMM kontent, email marketing.' },
  { id: '8', title: 'Data Analyst', company: 'DataCorp', logo: '📊', location: 'Toshkent', remote: false, type: 'Full-time', salary: '10-16M so\'m', category: 'IT', tags: ['SQL', 'Python', 'Tableau'], experience: '3+ yil', applicants: 41, posted: '2 kun', urgent: false, description: 'Ma\'lumotlar tahlili, dashboard yaratish, biznes insights.' },
];

const CATEGORIES = ['Hammasi', 'IT', 'Dizayn', 'Marketing', 'Kontent', 'Sotuvlar'];

export default function JobsPage() {
  const [cat, setCat] = useState('Hammasi');
  const [type, setType] = useState('Hammasi');
  const [search, setSearch] = useState('');

  const filtered = JOBS.filter((j) => (cat === 'Hammasi' || j.category === cat) && (type === 'Hammasi' || (type === 'remote' ? j.remote : j.type === type)) && (search === '' || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Ish o'rinlari 💼</h1>
          <p className="text-sm text-slate-500">Eng yaxshi ish imkoniyatlari O'zbekistonda</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Ish e'lon qilish</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ l: 'Faol vakansiyalar', v: JOBS.length, i: Briefcase, c: 'from-violet-500 to-purple-600' }, { l: 'Kompaniyalar', v: '120+', i: Building2, c: 'from-pink-500 to-rose-600' }, { l: 'Remote', v: JOBS.filter((j) => j.remote).length, i: Globe, c: 'from-blue-500 to-cyan-600' }, { l: 'Bu oy', v: '350+', i: TrendingUp, c: 'from-green-500 to-emerald-600' }].map((s) => (
          <Card key={s.l} className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', s.c)}>
              <s.i className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{s.v}</p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ish yoki kompaniya qidirish..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('rounded-full px-3 py-1.5 text-xs transition-all', cat === c ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900')}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['Hammasi', 'remote', 'Full-time', 'Part-time', 'Contract'].map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn('rounded-full px-3 py-1.5 text-xs transition-all', type === t ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((j) => (
          <Card key={j.id} className="group transition-all hover:shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 text-2xl">{j.logo}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{j.title}</h3>
                      {j.urgent && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">🔥 Shoshilinch</span>}
                    </div>
                    <p className="text-sm text-slate-500">{j.company} · {j.location} {j.remote && '· Remote mumkin'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon"><Heart className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Bookmark className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{j.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{j.salary}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{j.type}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{j.experience}</span>
                  {j.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{t}</span>)}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {j.posted} oldin</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {j.applicants} ariza</span>
                  </div>
                  <Button size="sm">Ariza berish</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
