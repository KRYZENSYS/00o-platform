'use client';
import { useState } from 'react';
import { TrendingUp, DollarSign, Users, Star, MapPin, Briefcase, MessageCircle, Sparkles, ArrowRight, BarChart3, Target, Rocket, Filter, Search, Plus, Check, Award, Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const INVESTORS = [
  { id: '1', name: 'Bobur Ergashev', avatar: 'BE', firm: 'Capital Ventures', title: 'Partner', location: 'Toshkent', invested: 12, totalFunding: '$5M+', ticket: '$50K - $500K', focus: ['FinTech', 'EdTech', 'SaaS'], rating: 4.9, verified: true, bio: '15 yil investitsiya tajribasi. 50+ startap, 5 exit. Forbes 30 under 30.', portfolio: ['PayUz', 'StudyHub', 'CRMPro'] },
  { id: '2', name: 'Malika Invest', avatar: 'MI', firm: 'IT Park VC', title: 'Investment Director', location: 'Toshkent', invested: 25, totalFunding: '$15M+', ticket: '$100K - $2M', focus: ['AI', 'AgriTech', 'HealthTech'], rating: 5.0, verified: true, bio: 'Davlat va xalqaro VC fondlari. Hokimiyat bilan yaqin hamkorlik.', portfolio: ['AIStudy', 'AgroBot', 'MedTech'] },
  { id: '3', name: 'Sardor K.', avatar: 'SK', firm: 'Angel Investor', title: 'Solo Angel', location: 'Dubai', invested: 8, totalFunding: '$2M+', ticket: '$10K - $100K', focus: ['AI', 'Blockchain', 'Mobile'], rating: 4.7, verified: false, bio: 'Ex-Google engineer. Angel investor. Yangi startaplarga e\'tibor.', portfolio: ['CryptoUz', 'AppX', 'Neural'] },
  { id: '4', name: 'Nilufar K.', avatar: 'NK', firm: 'Women in Tech', title: 'Founder & Investor', location: 'Remote', invested: 18, totalFunding: '$3M+', ticket: '$25K - $250K', focus: ['EdTech', 'Health', 'SaaS'], rating: 4.9, verified: true, bio: 'Women-led startaplarga e\'tibor. Mentor va investor.', portfolio: ['EduPro', 'HealthAI', 'TaskFlow'] },
  { id: '5', name: 'Jasur T.', avatar: 'JT', firm: 'Tech Fund', title: 'GP', location: 'Toshkent', invested: 30, totalFunding: '$25M+', ticket: '$200K - $5M', focus: ['Enterprise', 'B2B SaaS', 'AI'], rating: 4.8, verified: true, bio: 'Enterprise B2B fokus. 100+ investitsiya. Silicon Valley network.', portfolio: ['EnterpriseX', 'DataCorp', 'AIAgents'] },
  { id: '6', name: 'Aziz M.', avatar: 'AM', firm: 'Crypto Fund', title: 'Managing Partner', location: 'Singapore', invested: 15, totalFunding: '$50M+', ticket: '$500K - $10M', focus: ['Web3', 'Crypto', 'DeFi'], rating: 4.9, verified: true, bio: 'Web3 va crypto mutaxassisi. Yirik fondlar bilan hamkorlik.', portfolio: ['DeFiUz', 'NFTMarket', 'Web3Edu'] },
];

const FOCUS = ['Hammasi', 'FinTech', 'EdTech', 'SaaS', 'AI', 'AgriTech', 'HealthTech', 'Web3', 'Mobile'];

export default function InvestorsPage() {
  const [focus, setFocus] = useState('Hammasi');
  const [search, setSearch] = useState('');

  const filtered = INVESTORS.filter((i) => (focus === 'Hammasi' || i.focus.includes(focus)) && (search === '' || i.name.toLowerCase().includes(search.toLowerCase()) || i.firm.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Investorlar 💰</h1>
          <p className="text-sm text-slate-500">Startapingizga investitsiya toping</p>
        </div>
        <Button><Plus className="h-4 w-4" /> Investitsiya e'lon qilish</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ l: 'Investorlar', v: INVESTORS.length, i: TrendingUp, c: 'from-violet-500 to-purple-600' }, { l: 'Jami mablag\'', v: '$100M+', i: DollarSign, c: 'from-green-500 to-emerald-600' }, { l: 'Aktiv deal', v: '45', i: Rocket, c: 'from-pink-500 to-rose-600' }, { l: 'Yutuqli', v: '12', i: Award, c: 'from-amber-500 to-orange-600' }].map((s) => (
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Investor yoki firma qidirish..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FOCUS.map((f) => (
            <button key={f} onClick={() => setFocus(f)} className={cn('rounded-full px-3 py-1.5 text-xs transition-all', focus === f ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((i) => (
          <Card key={i.id} className="group transition-all hover:shadow-xl">
            <div className="flex items-start gap-4">
              <Avatar name={i.avatar} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{i.name}</h3>
                  {i.verified && <span className="text-blue-500">✓</span>}
                </div>
                <p className="text-sm text-slate-500">{i.title} · {i.firm}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {i.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {i.rating}</span>
                  <span className="flex items-center gap-1"><Rocket className="h-3 w-3" /> {i.invested} investitsiya</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{i.bio}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Jami mablag'</p>
                <p className="font-bold text-green-500">{i.totalFunding}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tiket hajmi</p>
                <p className="font-bold text-violet-500">{i.ticket}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {i.focus.map((f) => <span key={f} className="rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-500">{f}</span>)}
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="mb-2 text-xs text-slate-500">Portfolio:</p>
              <div className="flex flex-wrap gap-1">
                {i.portfolio.map((p) => <span key={p} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] dark:bg-slate-800">{p}</span>)}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1"><MessageCircle className="h-3 w-3" /> Xabar</Button>
              <Button size="sm" className="flex-1"><ArrowRight className="h-3 w-3" /> Pitch yuborish</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
