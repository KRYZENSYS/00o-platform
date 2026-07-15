'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { CheckSquare, StickyNote, Target, Flame, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: todoData } = useSWR('/todos/stats/summary', () => api.todoStats());
  const { data: habits } = useSWR('/habits', () => api.getHabits());
  const { data: feed } = useSWR('/posts/feed?limit=5', () => api.getFeed({ limit: 5 }));

  const stats = todoData?.data || { total: 0, completed: 0, pending: 0, overdue: 0 };
  const totalStreak = (habits?.data || []).reduce((sum: number, h: any) => sum + (h.streak || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Salom, {user?.displayName || user?.username}! 👋</h1>
        <p className="mt-1 text-text-muted">Bugun ajoyib kun — uni unutilmas qiling!</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={CheckSquare} label="Vazifalar" value={stats.total} sub={`${stats.completed} bajarildi`} color="from-violet-500 to-purple-600" />
        <StatCard icon={Flame} label="Streak" value={totalStreak} sub="kun ketma-ket" color="from-orange-500 to-red-600" />
        <StatCard icon={Target} label="Odatlar" value={habits?.data?.length || 0} sub="faol" color="from-pink-500 to-rose-600" />
        <StatCard icon={Trophy} label="Yutuqlar" value={0} sub="tez kunda" color="from-amber-500 to-yellow-600" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickAction href="/todos" icon={CheckSquare} label="Vazifa qo'shish" color="bg-violet-500/10 text-violet-500" />
        <QuickAction href="/notes" icon={StickyNote} label="Eslatma" color="bg-pink-500/10 text-pink-500" />
        <QuickAction href="/habits" icon={Target} label="Odat boshlash" color="bg-orange-500/10 text-orange-500" />
        <QuickAction href="/feed" icon={TrendingUp} label="Lenta" color="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>So'nggi postlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feed?.data?.length === 0 ? (
            <p className="text-sm text-text-muted">Hozircha postlar yo'q</p>
          ) : (
            feed?.data?.map((p: any) => (
              <Link key={p.id} href={`/feed#${p.id}`} className="flex items-start gap-3 rounded-xl p-3 hover:bg-surface-2">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium">@{p.user?.username}</p>
                  <p className="truncate text-sm text-text-muted">{p.content}</p>
                </div>
                <span className="text-xs text-text-muted">{timeAgo(p.createdAt)}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="mt-0.5 text-xs text-text-muted">{sub}</p>
          </div>
          <div className={`rounded-xl bg-gradient-to-br ${color} p-2.5 text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function QuickAction({ href, icon: Icon, label, color }: any) {
  return (
    <Link href={href} className="group">
      <Card className="transition-all hover:border-brand-500/50 hover:shadow-glow">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
      </Card>
    </Link>
  );
}
