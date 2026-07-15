'use client';
import { useState } from 'react';
import { Users, UserPlus, Search, MapPin, Briefcase, Star, MessageCircle, Sparkles, Rocket, Code, Megaphone, Target, Zap, Plus, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const PEOPLE = [
  { id: '1', name: 'Aziz Karimov', avatar: 'AK', title: 'Senior Full-Stack Dev', skills: ['Next.js', 'Python', 'PostgreSQL'], location: 'Toshkent', rating: 4.9, available: true, type: 'Co-founder', bio: '5+ yil tajriba. Startaplar yaratishga qiziqaman. AI va fintech.', projects: 12 },
  { id: '2', name: 'Malika Y.', avatar: 'MY', title: 'Product Designer', skills: ['Figma', 'UI/UX', 'Design System'], location: 'Samarqand', rating: 5.0, available: true, type: 'Team', bio: 'Mobile va web dizayn. 50+ loyiha. Glassmorphism va neomorphism mutaxassisi.', projects: 8 },
  { id: '3', name: 'Bobur E.', avatar: 'BE', title: 'AI/ML Engineer', skills: ['Python', 'TensorFlow', 'LLM'], location: 'Toshkent', rating: 4.8, available: false, type: 'Co-founder', bio: 'AI/ML mutaxassisi. LLM, RAG, agents. PhD Stanford.', projects: 15 },
  { id: '4', name: 'Sardor A.', avatar: 'S', title: 'DevOps Engineer', skills: ['Docker', 'K8s', 'AWS'], location: 'Remote', rating: 4.9, available: true, type: 'Team', bio: 'DevOps va Cloud arxitektura. Kubernetes, AWS, GCP.', projects: 20 },
  { id: '5', name: 'Nilufar', avatar: 'N', title: 'Marketing Manager', skills: ['SMM', 'SEO', 'Content'], location: 'Toshkent', rating: 4.7, available: true, type: 'Co-founder', bio: 'Digital marketing 7 yil. B2B va B2C. Startup growth specialist.', projects: 25 },
  { id: '6', name: 'Jasur', avatar: 'J', title: 'Mobile Developer', skills: ['Flutter', 'React Native', 'iOS'], location: 'Andijon', rating: 4.8, available: true, type: 'Team', bio: 'Cross-platform mobile. 30+ app. App Store featured.', projects: 30 },
];

const TYPES = ['Hammasi', 'Co-founder', 'Team'];

export default function TeamPage() {
  const [type, setType] = useState('Hammasi');
  const [search, setSearch] = useState('');

  const filtered = PEOPLE.filter((p) => (type === 'Hammasi' || p.type === type) && (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))));

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Jamoa topish 👥</h1>
          <p className="text-sm text-slate-500">Co-founder, hamkasblar va mentorlar toping</p>
        </div>
        <Button><UserPlus className="h-4 w-4" /> Profil yaratish</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ l: 'A\'zolar', v: '8,420', i: Users }, { l: 'Co-founder', v: '1,234', i: Rocket }, { l: 'Online', v: '342', i: Sparkles }, { l: 'Bugun qo\'shildi', v: '67', i: UserPlus }].map((s, i) => (
          <Card key={i} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ism yoki ko'nikma qidirish..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
        </div>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={cn('rounded-full px-4 py-1.5 text-sm transition-all', type === t ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="group transition-all hover:shadow-xl">
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar name={p.avatar} size="lg" />
                {p.available && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-slate-500">{p.title}</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating} · {p.projects} loyiha
                </div>
              </div>
              <button className="text-slate-400 hover:text-red-500"><Heart className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{p.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.skills.map((s) => <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{s}</span>)}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="h-3 w-3" /> {p.location}
              <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold', p.type === 'Co-founder' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>
                {p.type}
              </span>
            </div>
            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button size="sm" variant="outline" className="flex-1"><MessageCircle className="h-3 w-3" /> Xabar</Button>
              <Button size="sm" className="flex-1"><UserPlus className="h-3 w-3" /> Taklif</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
