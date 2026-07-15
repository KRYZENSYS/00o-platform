'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Rocket, Briefcase, MessageCircle, TrendingUp, DollarSign, Activity, AlertTriangle, Shield, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.admin.stats(), api.admin.users({ limit: 20 }), api.admin.reports({ limit: 20 })])
      .then(([s, u, r]) => {
        if (s.status === 'fulfilled') setStats(s.value.data);
        if (u.status === 'fulfilled') setUsers(u.value.data?.items || u.value.data || []);
        if (r.status === 'fulfilled') setReports(r.value.data?.items || r.value.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: 'overview', label: 'Umumiy', icon: TrendingUp },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'reports', label: 'Shikoyatlar', icon: AlertTriangle },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Admin Panel</h1>
          <p className="text-sm text-slate-500">Platforma boshqaruvi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { i: Users, l: 'Foydalanuvchilar', v: stats?.users_count || 0, c: 'text-blue-500' },
          { i: Rocket, l: 'Startaplar', v: stats?.startups_count || 0, c: 'text-pink-500' },
          { i: Briefcase, l: 'Marketplace', v: stats?.services_count || 0, c: 'text-cyan-500' },
          { i: Users, l: 'Vakansiyalar', v: stats?.jobs_count || 0, c: 'text-green-500' },
          { i: MessageCircle, l: 'Postlar', v: stats?.posts_count || 0, c: 'text-violet-500' },
          { i: DollarSign, l: 'Daromad', v: `${(stats?.revenue || 0).toLocaleString()} so'm`, c: 'text-amber-500' },
        ].map((s) => (
          <Card key={s.l}>
            <CardContent className="p-3">
              <s.i className={cn('h-4 w-4', s.c)} />
              <div className="mt-1 text-lg font-black">{s.v}</div>
              <div className="text-[10px] text-slate-500">{s.l}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1 dark:border-slate-800">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'border-violet-500 text-violet-500' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Faollik</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Bugun ro'yxatdan o'tgan</span><b>{stats?.today_signups || 0}</b></div>
                <div className="flex justify-between"><span>Bugun AI so'rovlar</span><b>{stats?.today_ai_requests || 0}</b></div>
                <div className="flex justify-between"><span>Online</span><b className="text-green-500">{stats?.online_users || 0}</b></div>
                <div className="flex justify-between"><span>Premium obunachilar</span><b>{stats?.premium_count || 0}</b></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tokenlar</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Jami tarqatilgan</span><b>{stats?.total_tokens || 0} 🪙</b></div>
                <div className="flex justify-between"><span>Bugun sarflangan</span><b>{stats?.today_tokens_spent || 0} 🪙</b></div>
                <div className="flex justify-between"><span>AI revenue</span><b>{stats?.ai_revenue || 0} so'm</b></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card>
          <CardHeader><CardTitle>So'nggi foydalanuvchilar</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.length === 0 && <p className="text-sm text-slate-500">Foydalanuvchilar yo\'q</p>}
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                  <Avatar src={u.avatar_url} alt={u.first_name || 'U'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{u.first_name} {u.last_name}</div>
                    <div className="text-[10px] text-slate-500">@{u.username || 'user'} • {new Date(u.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">{u.tokens || 0} 🪙</div>
                    {u.is_admin && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">Admin</span>}
                  </div>
                  <button onClick={() => api.admin.banUser(u.id).then(() => setUsers(users.filter((x) => x.id !== u.id)))} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'reports' && (
        <Card>
          <CardHeader><CardTitle>Shikoyatlar</CardTitle></CardHeader>
          <CardContent>
            {reports.length === 0 && <p className="text-sm text-slate-500">Shikoyatlar yo\'q 🎉</p>}
            <div className="space-y-2">
              {reports.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs text-slate-500">From: {r.reporter?.first_name} • Reason: {r.reason}</div>
                  <p className="mt-1 text-sm">{r.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => api.admin.resolveReport(r.id, 'dismissed').then(() => setReports(reports.filter((x) => x.id !== r.id)))}>Rad etish</Button>
                    <Button size="sm" variant="gradient" onClick={() => api.admin.resolveReport(r.id, 'action_taken').then(() => setReports(reports.filter((x) => x.id !== r.id)))}>Harakat</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...a: any[]) { return a.filter(Boolean).join(' '); }
