'use client';
import { useEffect, useState } from 'react';
import { Users, Rocket, Briefcase, DollarSign, Activity, AlertTriangle, Shield, BarChart3, Server, Database, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { formatNumber, cn } from '@/lib/utils';

export default function AdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'reports' | 'system'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user, tab]);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api.admin.stats();
      setStats(s.data);
      if (tab === 'users') {
        const u = await api.admin.listUsers({ limit: 50 });
        setUsers(u.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-6"><Card className="p-8 text-center"><Shield className="mx-auto mb-2 h-12 w-12 text-red-500" /><h2 className="text-lg font-bold">Ruxsat yo'q</h2><p className="text-sm text-slate-500">Bu sahifa faqat adminlar uchun</p></Card></div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl"><Shield className="h-6 w-6 text-violet-500" /> Admin Panel</h1>
        <p className="text-sm text-slate-500">Platforma boshqaruvi</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', l: 'Umumiy', i: BarChart3 },
          { id: 'users', l: 'Foydalanuvchilar', i: Users },
          { id: 'reports', l: 'Shikoyatlar', i: AlertTriangle },
          { id: 'system', l: 'Tizim', i: Server },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={cn('flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium', tab === t.id ? 'border-violet-500 text-violet-500' : 'border-transparent text-slate-500')}>
            <t.i className="h-3.5 w-3.5" /> {t.l}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { i: Users, l: 'Foydalanuvchilar', v: stats.totalUsers, c: 'from-violet-500 to-pink-500', s: `+${stats.newUsersToday} bugun` },
              { i: Rocket, l: 'Startaplar', v: stats.totalStartups, c: 'from-pink-500 to-orange-500', s: `${stats.activeUsers} faol` },
              { i: Briefcase, l: 'Xizmatlar', v: stats.totalServices, c: 'from-blue-500 to-cyan-500', s: `${stats.totalOrders} buyurtma` },
              { i: DollarSign, l: 'Daromad', v: `${formatNumber(stats.totalRevenue)} so'm`, c: 'from-green-500 to-emerald-500', s: 'Hammasi' },
            ].map((s) => (
              <Card key={s.l} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white', s.c)}>
                    <s.i className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-green-500">{s.s}</span>
                </div>
                <div className="text-xl font-bold md:text-2xl">{formatNumber(s.v)}</div>
                <div className="text-xs text-slate-500">{s.l}</div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-bold">📈 Yangi foydalanuvchilar (haftalik)</h3>
              <div className="flex h-40 items-end gap-1">
                {[12, 18, 25, 32, 28, 41, 56].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-pink-500" style={{ height: `${(h / 60) * 100}%` }} title={`${h} users`} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map(d => <span key={d}>{d}</span>)}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 text-sm font-bold">💎 Premium statistika</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm">Premium foydalanuvchilar</span><strong>{stats.premiumUsers}</strong></div>
                <div className="flex justify-between"><span className="text-sm">Aylantirish darajasi</span><strong>{((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%</strong></div>
                <div className="flex justify-between"><span className="text-sm">O'rtacha check</span><strong>99 000 so'm</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${(stats.premiumUsers / Math.max(stats.totalUsers, 1)) * 100}%` }} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h3 className="font-bold">Foydalanuvchilar ro'yxati ({users.length})</h3>
          </div>
          {loading ? <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div> :
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2">Roll</th>
                    <th className="px-4 py-2">Tokenlar</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs font-bold text-white">{u.firstName?.[0]}</div>
                          <span>{u.firstName} @{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-500">{u.email}</td>
                      <td className="px-4 py-2 text-center"><span className={cn('rounded-full px-2 py-0.5 text-xs', u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800')}>{u.role}</span></td>
                      <td className="px-4 py-2 text-center font-semibold">{u.tokens}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', u.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                          {u.isActive ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button size="sm" variant="outline" onClick={async () => {
                          if (confirm(`${u.username} ni ${u.isActive ? 'bloklash' : 'faqat ochish'}?`)) {
                            await (u.isActive ? api.admin.banUser(u.id) : api.admin.unbanUser(u.id));
                            load();
                          }
                        }}>
                          {u.isActive ? '🚫 Ban' : '✅ Unban'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </Card>
      )}

      {tab === 'reports' && (
        <Card className="p-8 text-center text-slate-500">
          <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
          <p>Shikoyatlar bo'limi tez orada</p>
        </Card>
      )}

      {tab === 'system' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Database className="h-4 w-4" /> Ma'lumotlar bazasi</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-green-500">✅ Online</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Ulanish</span><span>PostgreSQL 16</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Latency</span><span>12ms</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Jadval</span><span>18 ta</span></div>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Activity className="h-4 w-4" /> Tizim holati</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">CPU</span><span className="text-green-500">24%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">RAM</span><span>1.2 / 4 GB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Disk</span><span>15 / 80 GB</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Uptime</span><span>5 kun 14 soat</span></div>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Server className="h-4 w-4" /> Servislar</h3>
            <div className="space-y-2">
              {[
                { n: 'API Backend', s: 'running' },
                { n: 'Telegram Bot', s: 'running' },
                { n: 'PostgreSQL', s: 'running' },
                { n: 'Redis', s: 'running' },
                { n: 'Nginx', s: 'running' },
              ].map((s) => (
                <div key={s.n} className="flex items-center justify-between text-sm">
                  <span>{s.n}</span>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">● {s.s}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><TrendingUp className="h-4 w-4" /> Bugungi metrikalar</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">API so'rovlar</span><strong>15,234</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">AI so'rovlar</span><strong>1,847</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Yangi userlar</span><strong>{stats?.newUsersToday || 0}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Xatoliklar</span><strong className="text-green-500">0.02%</strong></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
