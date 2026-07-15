'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Rocket, Briefcase, Users, MessageCircle, TrendingUp, ArrowRight, Coins, Crown, Check, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([api.analytics.dashboard(), api.feed.list({ limit: 5 }), api.startups.list({ limit: 4 })])
      .then(([a, f, s]) => {
        if (a.status === 'fulfilled') setStats(a.value.data);
        if (f.status === 'fulfilled') setFeed(f.value.data?.items || f.value.data || []);
        if (s.status === 'fulfilled') setStartups(s.value.data?.items || s.value.data || []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-black md:text-3xl">Salom, {user?.first_name}! 👋</h2>
          <p className="mt-1 opacity-90">Bugun yana bir ajoyib g'oya yaratingamizmi?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/ai"><Button size="sm" className="bg-white text-violet-500 hover:bg-slate-100"><Sparkles className="h-4 w-4" /> AI bilan boshlash</Button></Link>
            <Link href="/startups/new"><Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10"><Rocket className="h-4 w-4" /> Startap yaratish</Button></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { i: Coins, l: 'Tokenlarim', v: user?.tokens ?? 0, c: 'text-amber-500', bg: 'bg-amber-500/10' },
          { i: Rocket, l: 'Startaplar', v: stats?.startups_count ?? 0, c: 'text-pink-500', bg: 'bg-pink-500/10' },
          { i: Users, l: 'Jamoa', v: stats?.team_count ?? 0, c: 'text-blue-500', bg: 'bg-blue-500/10' },
          { i: TrendingUp, l: 'AI so\'rovlar', v: stats?.ai_requests ?? 0, c: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-4">
              <div className={cn('mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl', s.bg)}>
                <s.i className={cn('h-5 w-5', s.c)} />
              </div>
              <div className="text-2xl font-black">{s.v}</div>
              <div className="text-xs text-slate-500">{s.l}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">Mashhur startaplar</h3>
            <Link href="/startups" className="text-sm text-violet-500 hover:underline">Barchasi <ArrowRight className="inline h-3 w-3" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {startups.length === 0 && [1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-20 rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>
            ))}
            {startups.map((s: any) => (
              <Link key={s.id} href={`/startups/${s.id}`}>
                <Card className="transition hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                        <Rocket className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.industry || 'General'}</div>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">{s.tagline || s.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                      <span>👀 {s.views || 0}</span>
                      <span>❤️ {s.likes || 0}</span>
                      <span>👥 {s.team_size || 1}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold">So'nggi yangiliklar</h3>
            <Link href="/feed" className="text-sm text-violet-500 hover:underline">Barchasi</Link>
          </div>
          <div className="space-y-2">
            {feed.length === 0 && [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-3"><div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" /></CardContent></Card>
            ))}
            {feed.map((p: any) => (
              <Card key={p.id} className="transition hover:shadow-md">
                <CardContent className="p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                    <span className="text-xs font-semibold">{p.author?.first_name || 'User'}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{p.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {user?.subscription_plan === 'free' && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pro'ga o'ting</h3>
                <p className="text-xs text-slate-500">Cheksiz AI, 500 🪙 har oy, premium modellar</p>
              </div>
            </div>
            <Link href="/premium"><Button variant="gradient"><Zap className="h-4 w-4" /> Pro'ga o'tish</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
