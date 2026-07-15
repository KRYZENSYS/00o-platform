'use client';
import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 1234, revenue: 0, posts: 5678, reports: 12 });

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('oo_access')}` } })
      .then((r) => r.json())
      .then((d) => setStats(d.data || stats))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-500/10 p-3 text-blue-500"><Users className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Foydalanuvchilar</p><p className="text-2xl font-bold">{formatNumber(stats.users)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-green-500/10 p-3 text-green-500"><DollarSign className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Daromad</p><p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-purple-500/10 p-3 text-purple-500"><Activity className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Postlar</p><p className="text-2xl font-bold">{formatNumber(stats.posts)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="rounded-xl bg-red-500/10 p-3 text-red-500"><AlertCircle className="h-6 w-6" /></div><div><p className="text-sm text-text-muted">Shikoyatlar</p><p className="text-2xl font-bold">{stats.reports}</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Tezkor amallar</h2>
          <div className="space-y-2">
            <a href="/admin/users" className="block rounded-xl bg-surface-2 p-3 text-sm hover:bg-surface-3">👥 Foydalanuvchilar</a>
            <a href="/admin/reports" className="block rounded-xl bg-surface-2 p-3 text-sm hover:bg-surface-3">🚨 Shikoyatlar</a>
            <a href="/admin/payments" className="block rounded-xl bg-surface-2 p-3 text-sm hover:bg-surface-3">💳 To'lovlar</a>
            <a href="/admin/posts" className="block rounded-xl bg-surface-2 p-3 text-sm hover:bg-surface-3">📝 Postlar</a>
            <a href="/admin/analytics" className="block rounded-xl bg-surface-2 p-3 text-sm hover:bg-surface-3">📊 Tahlil</a>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Tizim holati</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>API</span><span className="text-green-500">● Online</span></div>
            <div className="flex justify-between"><span>Database</span><span className="text-green-500">● Online</span></div>
            <div className="flex justify-between"><span>Redis</span><span className="text-green-500">● Online</span></div>
            <div className="flex justify-between"><span>Bot</span><span className="text-green-500">● Online</span></div>
            <div className="flex justify-between"><span>CDN</span><span className="text-green-500">● Online</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
