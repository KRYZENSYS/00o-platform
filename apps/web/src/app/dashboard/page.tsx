'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Rocket, Briefcase, Users, TrendingUp, DollarSign,
  ArrowRight, Eye, Heart, MessageCircle, Crown, Coins, BookOpen,
  ChevronRight, Plus, BarChart3, Zap, FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { formatNumber, formatRelative, cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [recentStartups, setRecentStartups] = useState<any[]>([]);
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, a, st, sv, tr] = await Promise.allSettled([
        api.analytics.dashboard(),
        api.ai.usage(),
        api.startups.list({ limit: 6 }),
        api.marketplace.services({ limit: 6 }),
        api.feed.trending(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value.data);
      if (a.status === 'fulfilled') setAiUsage(a.value.data);
      if (st.status === 'fulfilled') setRecentStartups(st.value.data || []);
      if (sv.status === 'fulfilled') setRecentServices(sv.value.data || []);
      if (tr.status === 'fulfilled') setTrending(tr.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 p-6 text-white md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Salom, {user?.firstName || user?.username || 'foydalanuvchi'}! 👋
            </h1>
            <p className="mt-1 opacity-90">Bugun qanday ajoyib g'oyalar yaratamiz?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/ai"><Button size="sm" className="bg-white text-violet-500 hover:bg-slate-100"><Sparkles className="h-4 w-4" /> AI Chat</Button></Link>
            <Link href="/startups/new"><Button size="sm" className="bg-white/20 text-white backdrop-blur hover:bg-white/30"><Plus className="h-4 w-4" /> Yangi startap</Button></Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[
          { i: Coins, c: 'from-violet-500 to-pink-500', t: 'Tokenlar', v: formatNumber(user?.tokens || 0), s: <Link href="/tokens" className="text-xs opacity-80">+ Top up →</Link> },
          { i: Sparkles, c: 'from-pink-500 to-orange-500', t: 'AI ishlatilgan', v: formatNumber(stats?.aiUsage?.today || 0), s: <span className="text-xs opacity-80">bugun</span> },
          { i: Rocket, c: 'from-orange-500 to-yellow-500', t: 'Startaplar', v: formatNumber(stats?.startups || 0), s: <Link href="/startups" className="text-xs opacity-80">barchasi →</Link> },
          { i: TrendingUp, c: 'from-green-500 to-emerald-500', t: 'XP / Level', v: user?.level || 'Bronze', s: <span className="text-xs opacity-80">{user?.xp || 0} XP</span> },
        ].map((s) => (
          <Card key={s.t} className="overflow-hidden p-0">
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.c} text-white`}>
                  <s.i className="h-4 w-4" />
                </div>
                {s.s}
              </div>
              <div className="text-2xl font-bold">{s.v}</div>
              <div className="text-xs text-slate-500">{s.t}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick AI tools */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>⚡ Tezkor AI vositalar</CardTitle>
            <p className="text-xs text-slate-500">Bir bosishda ishni boshlang</p>
          </div>
          <Link href="/ai/tools"><Button variant="ghost" size="sm">Barchasi <ChevronRight className="h-4 w-4" /></Button></Link>
        </CardHeader>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            { i: '💡', t: 'Startup g\'oya', h: '/ai/tools?tool=startup-idea' },
            { i: '📊', t: 'Biznes-plan', h: '/ai/tools?tool=business-plan' },
            { i: '💻', t: 'Kod yozish', h: '/ai/tools?tool=code' },
            { i: '📝', t: 'Rezyume', h: '/ai/tools?tool=resume' },
            { i: '🌐', t: 'Tarjima', h: '/ai/tools?tool=translate' },
            { i: '✍️', t: 'Blog post', h: '/ai/tools?tool=blog' },
            { i: '📱', t: 'Ijtimoiy post', h: '/ai/tools?tool=social' },
            { i: '🎯', t: 'Pitch deck', h: '/ai/tools?tool=pitch' },
          ].map((q) => (
            <Link key={q.t} href={q.h} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-center transition-all hover:border-violet-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950">
              <div className="mb-1 text-2xl">{q.i}</div>
              <div className="text-xs font-medium">{q.t}</div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trending Startups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4" /> Trendagi startaplar</CardTitle>
            <Link href="/startups"><Button variant="ghost" size="sm">Barchasi <ChevronRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />)}</div>
          ) : recentStartups.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">Hozircha startaplar yo'q</div>
          ) : (
            <div className="space-y-2">
              {recentStartups.map((s) => (
                <Link key={s.id} href={`/startups/${s.slug}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-all hover:border-violet-500/50 dark:border-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white">
                    {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full rounded-xl object-cover" /> : s.name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold">{s.name}</p>
                      {s.isFeatured && <Crown className="h-3 w-3 text-amber-500" />}
                    </div>
                    <p className="truncate text-xs text-slate-500">{s.tagline || s.description}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {s.viewsCount || 0}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {s.likesCount || 0}</span>
                      <span>{s.stage}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Side widgets */}
        <div className="space-y-4">
          {/* AI Usage */}
          {aiUsage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4" /> AI limit</CardTitle>
                {!user?.isPremium && <Link href="/premium"><Button variant="gradient" size="sm">Pro</Button></Link>}
              </CardHeader>
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{aiUsage.today}<span className="text-sm text-slate-500"> / {aiUsage.limit === -1 ? '∞' : aiUsage.limit}</span></div>
                  <div className="text-xs text-slate-500">bugun</div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className={cn('h-full bg-gradient-to-r from-violet-500 to-pink-500')} style={{ width: `${aiUsage.limit > 0 ? Math.min(100, (aiUsage.today / aiUsage.limit) * 100) : 50}%` }} />
                </div>
                <p className="text-xs text-slate-500">Oy davomida: {aiUsage.month} so'rov</p>
              </div>
            </Card>
          )}

          {/* Trending posts */}
          {trending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trendagi postlar</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {trending.slice(0, 3).map((p) => (
                  <Link key={p.id} href={`/feed/${p.id}`} className="block">
                    <p className="line-clamp-2 text-sm font-medium hover:text-violet-500">{p.content}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-500">
                      <span>@{p.user?.username}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {p.likesCount}</span>
                      <span>{formatRelative(p.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Refer & Earn */}
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-pink-500/5">
            <div className="text-center">
              <div className="mb-2 text-3xl">🎁</div>
              <h3 className="mb-1 font-bold">Do'stlaringizni taklif qiling</h3>
              <p className="mb-3 text-xs text-slate-500">Har bir do'st uchun 100 🪙, Premium foydalanuvchilar uchun 500 🪙</p>
              <Link href="/referrals"><Button variant="gradient" size="sm" fullWidth>Taklif havolasini olish</Button></Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Trending Services */}
      {recentServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Top xizmatlar</CardTitle>
            <Link href="/marketplace"><Button variant="ghost" size="sm">Barchasi <ChevronRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentServices.map((s) => (
              <Link key={s.id} href={`/marketplace/${s.id}`} className="group rounded-xl border border-slate-100 p-3 transition-all hover:border-violet-500/50 dark:border-slate-800">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-lg">💼</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.title}</p>
                    <p className="truncate text-xs text-slate-500">{s.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-500">{formatNumber(s.price)} {s.currency}</span>
                  <span className="text-slate-500">⭐ {s.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
