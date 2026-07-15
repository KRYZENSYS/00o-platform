'use client';
import { Trophy, Lock, Star, Flame, Target, Zap, Crown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ACHIEVEMENTS = [
  { id: 1, icon: '🎯', name: 'Birinchi qadam', desc: 'Birinchi vazifani bajaring', xp: 10, unlocked: true, color: 'from-violet-500 to-purple-600' },
  { id: 2, icon: '🔥', name: '7 kunlik streak', desc: '7 kun ketma-ket faol bo\'ling', xp: 50, unlocked: true, color: 'from-orange-500 to-red-600' },
  { id: 3, icon: '⭐', name: 'Yulduz yig\'uvchi', desc: '100 ta XP to\'plang', xp: 30, unlocked: true, color: 'from-amber-400 to-yellow-600' },
  { id: 4, icon: '💪', name: 'Odat ustasi', desc: '30 kunlik streak', xp: 200, unlocked: false, color: 'from-pink-500 to-rose-600' },
  { id: 5, icon: '📚', name: 'Bilim izlovchisi', desc: '10 ta darsni tugating', xp: 100, unlocked: false, color: 'from-blue-500 to-cyan-600' },
  { id: 6, icon: '🏆', name: 'Chempion', desc: 'Top 10 ga kiring', xp: 500, unlocked: false, color: 'from-yellow-500 to-orange-600' },
  { id: 7, icon: '💎', name: 'Premium', desc: 'Premium ga obuna bo\'ling', xp: 300, unlocked: false, color: 'from-cyan-400 to-blue-600' },
  { id: 8, icon: '🚀', name: 'Tezkor', desc: 'Bir kunda 10 vazifa', xp: 75, unlocked: true, color: 'from-green-500 to-emerald-600' },
  { id: 9, icon: '🌟', name: 'Ijtimoiy', desc: '50 ta follower to\'plang', xp: 150, unlocked: false, color: 'from-fuchsia-500 to-pink-600' },
  { id: 10, icon: '💰', name: 'Boylik', desc: '1,000,000 so\'m jamg\'aring', xp: 250, unlocked: false, color: 'from-emerald-500 to-teal-600' },
  { id: 11, icon: '🎨', name: 'Yaratuvchi', desc: '100 ta post yozing', xp: 200, unlocked: false, color: 'from-indigo-500 to-purple-600' },
  { id: 12, icon: '👑', name: 'Afsona', desc: '1 yil faol bo\'ling', xp: 1000, unlocked: false, color: 'from-amber-500 to-yellow-600' },
];

const LEVELS = [
  { name: 'Yangi boshlovchi', min: 0, color: 'text-slate-500' },
  { name: 'Faol foydalanuvchi', min: 100, color: 'text-blue-500' },
  { name: 'Tajribali', min: 500, color: 'text-purple-500' },
  { name: 'Usta', min: 2000, color: 'text-pink-500' },
  { name: 'Chempion', min: 5000, color: 'text-orange-500' },
  { name: 'Afsona', min: 10000, color: 'text-amber-500' },
];

export default function AchievementsPage() {
  const totalXP = 1250;
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const currentLevel = [...LEVELS].reverse().find((l) => totalXP >= l.min) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > totalXP);
  const progress = nextLevel ? ((totalXP - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yutuqlar</h1>
        <p className="mt-1 text-text-muted">Kashf et, yutuqqa erish, faxrlan!</p>
      </div>

      {/* Current level */}
      <Card className="bg-gradient-to-br from-brand-500/10 to-pink-500/10">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl text-white shadow-glow">
            <Crown className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${currentLevel.color}`}>{currentLevel.name}</p>
            <p className="text-2xl font-bold">{totalXP} XP</p>
            {nextLevel && (
              <div className="mt-2">
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-text-muted">{nextLevel.name} gacha {nextLevel.min - totalXP} XP</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center"><Trophy className="mx-auto h-8 w-8 text-amber-500" /><p className="mt-2 text-2xl font-bold">{unlocked}</p><p className="text-xs text-text-muted">ochilgan</p></Card>
        <Card className="text-center"><Lock className="mx-auto h-8 w-8 text-text-muted" /><p className="mt-2 text-2xl font-bold">{ACHIEVEMENTS.length - unlocked}</p><p className="text-xs text-text-muted">yashirin</p></Card>
        <Card className="text-center"><Star className="mx-auto h-8 w-8 text-yellow-500" /><p className="mt-2 text-2xl font-bold">{unlocked * 50}</p><p className="text-xs text-text-muted">bonus XP</p></Card>
      </div>

      {/* Achievements grid */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Barcha yutuqlar</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => (
            <Card key={a.id} className={cn('group relative overflow-hidden transition-all', !a.unlocked && 'opacity-60 grayscale')}>
              <div className={`absolute inset-0 bg-gradient-to-br ${a.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              <div className="relative">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${a.color} text-2xl shadow-lg`}>
                  {a.unlocked ? a.icon : <Lock className="h-6 w-6 text-white" />}
                </div>
                <h3 className="mt-3 text-sm font-semibold">{a.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-text-muted">{a.desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-500">+{a.xp} XP</span>
                  {a.unlocked && <span className="text-xs text-green-500">✓</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
