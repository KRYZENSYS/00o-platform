'use client';
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown, Eye, MousePointerClick, Globe, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tahlil</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Foydalanuvchilar</p>
              <p className="text-2xl font-bold">12,450</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-green-500"><ArrowUp className="h-3 w-3" />+12.5%</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500"><Users className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Daromad</p>
              <p className="text-2xl font-bold">₽2.4M</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-green-500"><ArrowUp className="h-3 w-3" />+8.2%</p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-3 text-green-500"><DollarSign className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Sahifa ko\'rishlar</p>
              <p className="text-2xl font-bold">145K</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-green-500"><ArrowUp className="h-3 w-3" />+24%</p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-500"><Eye className="h-6 w-6" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Konversiya</p>
              <p className="text-2xl font-bold">3.4%</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><ArrowDown className="h-3 w-3" />-0.5%</p>
            </div>
            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500"><MousePointerClick className="h-6 w-6" /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Haftalik faollik</h2>
          <div className="flex h-48 items-end gap-2">
            {[45, 65, 55, 80, 70, 90, 75].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-pink-500 transition-all hover:opacity-80" style={{ height: `${v}%` }} />
                <span className="text-xs text-text-muted">{['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">Qurilmalar</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm"><span>📱 Mobile</span><span>68%</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-blue-500" style={{ width: '68%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>💻 Desktop</span><span>27%</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-green-500" style={{ width: '27%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>📱 Tablet</span><span>5%</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-orange-500" style={{ width: '5%' }} /></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Top sahifalar</h2>
          <div className="space-y-2">
            {[
              { page: '/dashboard', views: 12450, percent: 100 },
              { page: '/todos', views: 8920, percent: 72 },
              { page: '/feed', views: 6780, percent: 54 },
              { page: '/finance', views: 5430, percent: 44 },
              { page: '/games', views: 4320, percent: 35 },
            ].map((p) => (
              <div key={p.page}>
                <div className="flex justify-between text-sm"><span>{p.page}</span><span>{p.views.toLocaleString()}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-gradient-to-r from-brand-500 to-pink-500" style={{ width: `${p.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Hududlar</h2>
          <div className="space-y-3">
            {[
              { country: '🇺🇿 O\'zbekiston', users: 8400, percent: 67 },
              { country: '🇷🇺 Rossiya', users: 2100, percent: 17 },
              { country: '🇰🇿 Qozog\'iston', users: 1100, percent: 9 },
              { country: '🇰🇬 Qirg\'iziston', users: 540, percent: 4 },
              { country: '🇹🇯 Tojikiston', users: 310, percent: 3 },
            ].map((c) => (
              <div key={c.country} className="flex items-center justify-between">
                <span className="text-sm">{c.country}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{c.users.toLocaleString()}</span>
                  <span className="text-xs text-text-muted">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
