'use client';
import { useEffect, useState } from 'react';
import { Bell, Search, TrendingUp, Users, Briefcase, DollarSign, MessageSquare, Plus, ArrowUp, ArrowDown, Sparkles, Eye, Heart, Star, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Salom, {user?.firstName || user?.username || 'User'} 👋</h1>
          <p className="text-sm text-slate-500">Bugun ajoyib kun! Yangi imkoniyatlar sizni kutmoqda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
          </Button>
          <Button><Plus className="h-4 w-4" /> Yaratish</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'XP Points', value: '2,450', change: '+12%', up: true, icon: Zap, color: 'from-violet-500 to-purple-600' },
          { label: 'Followers', value: '1,234', change: '+8%', up: true, icon: Users, color: 'from-pink-500 to-rose-600' },
          { label: 'Earned', value: '$5,420', change: '+24%', up: true, icon: DollarSign, color: 'from-green-500 to-emerald-600' },
          { label: 'Views', value: '8,420', change: '-3%', up: false, icon: Eye, color: 'from-orange-500 to-amber-600' },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
                <p className={`mt-1 flex items-center gap-1 text-xs ${s.up ? 'text-green-500' : 'text-red-500'}`}>
                  {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {s.change}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-lg font-bold">Tezkor amallar</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Post', icon: '✍️', color: 'from-violet-500 to-purple-600' },
              { label: 'Startap', icon: '🚀', color: 'from-pink-500 to-rose-600' },
              { label: 'Xizmat', icon: '💼', color: 'from-orange-500 to-amber-600' },
              { label: 'Ish', icon: '💼', color: 'from-blue-500 to-cyan-600' },
              { label: 'AI', icon: '🤖', color: 'from-emerald-500 to-teal-600' },
              { label: 'Stat', icon: '📊', color: 'from-red-500 to-pink-600' },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-violet-500 dark:border-slate-800 dark:bg-slate-900">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-lg text-white`}>{a.icon}</div>
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Faollik</h2>
            <div className="flex gap-1">
              {['7 kun', '30 kun', 'Yil'].map((p) => (
                <button key={p} className={`rounded-lg px-3 py-1 text-xs ${p === '7 kun' ? 'bg-violet-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex h-48 items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 70, 60, 85, 75, 95, 65].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-gradient-to-t from-violet-500 to-pink-500" style={{ height: `${v}%` }} />
                <span className="text-[10px] text-slate-500">{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-bold">So'nggi faollik</h2>
          <div className="space-y-3">
            {[
              { who: 'Aziz', action: 'postingizga like bosdi', time: '5 daq', icon: Heart, color: 'text-red-500' },
              { who: 'Malika', action: 'sizni follow qildi', time: '1 soat', icon: Users, color: 'text-blue-500' },
              { who: 'AI', action: 'resume yaratdi', time: '2 soat', icon: Sparkles, color: 'text-violet-500' },
              { who: 'Bobur', action: 'xabar yubordi', time: '3 soat', icon: MessageSquare, color: 'text-green-500' },
              { who: 'Tizim', action: 'Yangi yutuq berildi!', time: '5 soat', icon: Star, color: 'text-amber-500' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm"><span className="font-semibold">{a.who}</span> {a.action}</p>
                  <p className="text-xs text-slate-500">{a.time} oldin</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-bold">🔥 Trending</h2>
          <div className="space-y-3">
            {[
              { rank: 1, title: 'AI Health Tracker', change: '+340%' },
              { rank: 2, title: 'O\'zbek CRM', change: '+220%' },
              { rank: 3, title: 'Telegram Shop', change: '+180%' },
              { rank: 4, title: 'EdTech Platform', change: '+150%' },
              { rank: 5, title: 'FinTech Wallet', change: '+120%' },
            ].map((t) => (
              <div key={t.rank} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${t.rank === 1 ? 'bg-amber-500 text-white' : t.rank === 2 ? 'bg-slate-400 text-white' : t.rank === 3 ? 'bg-orange-700 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>{t.rank}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                </div>
                <span className="text-xs font-semibold text-green-500">{t.change}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">AI tavsiya</h3>
              <p className="mt-1 text-sm text-slate-500">Sizning ko'nikmalaringizga asosan 12 ta mos startap topildi</p>
            </div>
          </div>
          <Button>Ko'rish</Button>
        </div>
      </Card>
    </div>
  );
}
