'use client';
import { Crown, Medal, TrendingUp, Trophy, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const LEADERBOARD = [
  { rank: 1, name: 'Aziz Karimov', username: 'aziz_k', xp: 12450, streak: 365, badge: '👑', color: 'from-amber-400 to-yellow-600' },
  { rank: 2, name: 'Malika Yusupova', username: 'malika_y', xp: 11200, streak: 280, badge: '🥈', color: 'from-slate-300 to-slate-500' },
  { rank: 3, name: 'Bobur Ergashev', username: 'bobur_e', xp: 10800, streak: 220, badge: '🥉', color: 'from-orange-400 to-amber-600' },
  { rank: 4, name: 'Nilufar Saidova', username: 'nilufar_s', xp: 9500, streak: 180, badge: '⭐', color: 'from-purple-400 to-pink-600' },
  { rank: 5, name: 'Sherzod Toshmatov', username: 'sherzod_t', xp: 8900, streak: 150, badge: '⭐', color: 'from-blue-400 to-cyan-600' },
  { rank: 6, name: 'Dilfuza Mahmudova', username: 'dilfuza_m', xp: 8200, streak: 130, badge: '⭐', color: 'from-green-400 to-emerald-600' },
  { rank: 7, name: 'Jasur Abdullayev', username: 'jasur_a', xp: 7500, streak: 110, badge: '⭐', color: 'from-pink-400 to-rose-600' },
  { rank: 8, name: 'Madina Qodirova', username: 'madina_q', xp: 6800, streak: 95, badge: '⭐', color: 'from-violet-400 to-purple-600' },
];

export default function LeaderboardPage() {
  const top3 = LEADERBOARD.slice(0, 3);
  const others = LEADERBOARD.slice(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liderlar doskasi</h1>
        <p className="mt-1 text-text-muted">Eng faol foydalanuvchilar</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-2">
        {top3.map((u, idx) => {
          const heights = ['h-32', 'h-40', 'h-28'];
          const order = [1, 0, 2]; // 2nd, 1st, 3rd
          const i = order.indexOf(idx);
          return (
            <div key={u.rank} className={cn('flex flex-col items-center justify-end', i === 0 && 'order-2', i === 1 && 'order-1', i === 2 && 'order-3')}>
              <Avatar name={u.name} size="lg" className="ring-4 ring-amber-500/30" />
              <p className="mt-2 truncate text-center text-sm font-semibold">{u.name}</p>
              <p className="text-xs text-text-muted">{u.xp.toLocaleString()} XP</p>
              <div className={cn('mt-2 flex w-full items-center justify-center rounded-t-2xl bg-gradient-to-b text-2xl font-bold text-white shadow-lg', u.color, heights[i])}>
                {u.badge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Period filter */}
      <div className="flex gap-2 overflow-x-auto">
        {['Bugun', 'Hafta', 'Oy', 'Yil', 'Hammasi'].map((p, i) => (
          <button key={p} className={cn('rounded-full border px-4 py-1.5 text-sm transition-all', i === 1 ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-surface-2')}>
            {p}
          </button>
        ))}
      </div>

      {/* Full list */}
      <Card>
        <div className="space-y-2">
          {LEADERBOARD.map((u) => (
            <div key={u.rank} className={cn('flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2', u.rank <= 3 && 'bg-gradient-to-r from-amber-500/5 to-orange-500/5')}>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl font-bold', u.rank === 1 ? 'bg-amber-500 text-white' : u.rank === 2 ? 'bg-slate-400 text-white' : u.rank === 3 ? 'bg-orange-500 text-white' : 'bg-surface-2')}>
                {u.rank}
              </div>
              <Avatar name={u.name} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-text-muted">@{u.username}</p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-sm font-semibold">{u.xp.toLocaleString()}</p>
                  <p className="text-xs text-text-muted">XP</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-500">
                  <Flame className="h-3 w-3" /> {u.streak}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
