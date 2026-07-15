'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Rocket, Briefcase, MessageCircle, Users, TrendingUp, Crown, Eye, Heart, Zap, ArrowRight, Plus, Bell, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatNumber, levelFromXP, formatRelative, cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Salom');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 6 ? 'Xayrli tun' : h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech');
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, f, st] = await Promise.allSettled([
        api.analytics.dashboard(),
        api.feed.list({ limit: 5 }),
        api.startups.list({ limit: 4, sort: 'popular' }),
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (f.status === 'fulfilled') setFeed(f.value.data || []);
      if (st.status === 'fulfilled') setStartups(st.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const lvl = user?.xp ? levelFromXP(user.xp) : { level: 'Bronze', progress: 0 };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <h2 className="mb-2 text-xl font-bold">Kirish kerak</h2>
          <p className="mb-4 text-sm text-slate-500">Dashboard ko'rish uchun tizimga kiring</p>
          <Link href="/auth/login"><Button variant="gradient">Kirish</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{greeting}, {user?.firstName}! 👋</h1>
          <p className="text-sm text-slate-500">Bugun ajoyib narsa qilamizmi?</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications"><Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button></Link>
          <Link href="/search"><Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button></Link>
        </div>
      </div>

      {/* Profile & Level Card */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 p-6 text-white">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div>
                <p className="text-lg font-bold">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm opacity-90">@{user?.username}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs backdrop-blur">{lvl.level}</span>
                  {user?.isPremium && <span className="flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold"><Crown className="h-2.5 w-2.5" /> PRO</span>}
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs opacity-90">Tokenlar</p>
              <p className="text-2xl font-black">🪙 {formatNumber(user?.tokens || 0)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span>XP: {user?.xp || 0}</span>
              <span>{lvl.progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white" style={{ width: `${lvl.progress}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { i: Sparkles, l: 'AI Chat', c: 'from-violet-500 to-pink-500', href: '/ai' },
          { i: Rocket, l: 'Startap', c: 'from-pink-500 to-orange-500', href: '/startups' },
          { i: Briefcase, l: 'Marketplace', c: 'from-blue-500 to-cyan-500', href: '/marketplace' },
          { i: Users, l: 'Jamoa', c: 'from-green-500 to-emerald-500', href: '/jobs' },
        ].map((a) => (
          <Link key={a.l} href={a.href}>
            <Card className="group flex h-full flex-col items-center gap-2 p-3 text-center transition hover:shadow-lg">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', a.c)}>
                <a.i className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold">{a.l}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: 'Startaplar', v: stats?.startups || 0, i: Rocket, c: 'text-pink-500' },
          { l: 'Obunachilar', v: stats?.followers || 0, i: Users, c: 'text-violet-500' },
          { l: 'AI so\'rovlar', v: stats?.aiRequests || 0, i: Zap, c: 'text-blue-500' },
          { l: 'XP', v: user?.xp || 0, i: TrendingUp, c: 'text-green-500' },
        ].map((s) => (
          <Card key={s.l} className="p-3">
            <s.i className={cn('h-4 w-4', s.c)} />
            <p className="mt-1 text-xl font-bold">{formatNumber(s.v)}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trending startups */}
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1 text-sm font-bold"><TrendingUp className="h-4 w-4 text-pink-500" /> Trend startaplar</h2>
            <Link href="/startups" className="text-xs text-violet-500 hover:underline">Barchasi →</Link>
          </div>
          <div className="space-y-2">
            {startups.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/startups/${s.slug}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-bold text-white">{s.name?.[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-xs text-slate-500">{s.tagline || s.category}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{formatNumber(s.likesCount || 0)}</span>
                  <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{formatNumber(s.viewsCount || 0)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-1 text-sm font-bold"><Bell className="h-4 w-4 text-violet-500" /> Faollik</h2>
          {feed.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">Hozircha faollik yo'q</div>
          ) : (
            <div className="space-y-2">
              {feed.slice(0, 5).map((p) => (
                <div key={p.id} className="rounded-xl p-2 text-xs">
                  <p className="font-semibold">{p.user?.firstName || 'Kimdir'}</p>
                  <p className="text-slate-500 line-clamp-2">{p.content}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{formatRelative(p.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* AI Tip */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10 p-4">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold flex items-center gap-1"><Sparkles className="h-4 w-4 text-violet-500" /> AI bilan startap g'oyasi toping</p>
              <p className="mt-1 text-xs text-slate-500">10 token evaziga 3 ta batafsil startup g'oya oling</p>
            </div>
            <Link href="/ai"><Button variant="gradient" size="sm">Boshlash <ArrowRight className="h-3 w-3" /></Button></Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
