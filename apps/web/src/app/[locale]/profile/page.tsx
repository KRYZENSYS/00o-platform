'use client';
import { MapPin, Briefcase, Calendar, Link as LinkIcon, Mail, Users, Star, Award, Edit, Camera, Heart, MessageCircle, Share2, TrendingUp, Sparkles, Target, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Cover & Avatar */}
      <Card className="overflow-hidden p-0">
        <div className="relative h-48 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500">
          <button className="absolute right-3 top-3 flex h-8 items-center gap-1 rounded-lg bg-black/50 px-3 text-xs text-white backdrop-blur"><Camera className="h-3 w-3" /> Cover</button>
        </div>
        <div className="relative -mt-16 px-6 pb-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
              <div className="relative">
                <Avatar name={user?.username || 'U'} size="xl" className="border-4 border-white dark:border-slate-900" />
                <button className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow dark:bg-slate-800"><Camera className="h-3 w-3" /></button>
              </div>
              <div className="md:pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user?.firstName || user?.username || 'User'}</h1>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">✓ Verified</span>
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-xs text-white"><Crown className="mr-1 inline h-3 w-3" />Premium</span>
                </div>
                <p className="text-sm text-slate-500">@{user?.username}</p>
                <p className="mt-2 text-sm">Full-stack dasturchi | AI enthusiast | Startup founder 🚀</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> 00o.uz</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Toshkent, O'zbekiston</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 2024 da qo'shildi</span>
                  <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3" /> 00o.uz/@{user?.username}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Mail className="h-3 w-3" /> Xabar</Button>
              <Button size="sm"><Edit className="h-3 w-3" /> Tahrirlash</Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            {[{ l: 'Followers', v: '1,234' }, { l: 'Following', v: '567' }, { l: 'Posts', v: '89' }, { l: 'XP', v: '2,450' }, { l: 'Rating', v: '4.9★' }].map((s) => (
              <div key={s.l}>
                <p className="text-lg font-bold">{s.v}</p>
                <p className="text-xs text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* About */}
          <Card>
            <h2 className="mb-3 font-bold">Haqida</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">5+ yil tajribaga ega full-stack dasturchi. AI, blockchain va fintech sohalarida ishlayman. 00o.uz platformasining asoschisi va CTO. O'zbek tilidagi eng katta IT community ning faol a'zosi.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {[{ i: Award, l: 'Yutuqlar', v: '12' }, { i: Target, l: 'Loyihalar', v: '24' }, { i: TrendingUp, l: 'Investitsiyalar', v: '5' }, { i: Zap, l: 'AI Token', v: '5,420' }].map((s) => (
                <div key={s.l} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <s.i className="h-4 w-4 text-violet-500" />
                  <p className="mt-1 text-lg font-bold">{s.v}</p>
                  <p className="text-xs text-slate-500">{s.l}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <h2 className="mb-3 font-bold">Ko'nikmalar</h2>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'AI/ML', 'Telegram Bot', 'Node.js', 'Docker', 'AWS', 'Figma'].map((s) => (
                <span key={s} className="rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-3 py-1 text-xs font-semibold text-violet-500">{s}</span>
              ))}
            </div>
          </Card>

          {/* Posts */}
          <Card>
            <h2 className="mb-3 font-bold">So'nggi postlar</h2>
            <div className="space-y-3">
              {[{ c: 'Yangi startapimiz 50K foydalanuvchiga yetdi!', t: '2 soat', l: 234, m: 45 }, { c: 'AI bilan kod yozish - kelajak bu yerda!', t: '1 kun', l: 412, m: 67 }, { c: 'Telegram bot orqali daromad', t: '3 kun', l: 156, m: 23 }].map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <p className="text-sm">{p.c}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span>{p.t} oldin</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {p.l}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.m}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-violet-500 to-pink-500 text-white">
            <Sparkles className="h-8 w-8" />
            <h3 className="mt-2 font-bold">Profilingizni yaxshilang</h3>
            <p className="mt-1 text-sm text-white/90">AI profilingizni tahlil qilib, yaxshilash bo'yicha tavsiyalar beradi</p>
            <Button size="sm" variant="outline" className="mt-3 w-full border-white bg-white text-violet-600 hover:bg-white/90">AI tahlil</Button>
          </Card>

          <Card>
            <h3 className="mb-3 font-bold">Yutuqlar</h3>
            <div className="grid grid-cols-3 gap-2">
              {['🚀', '💎', '⭐', '🎯', '🔥', '👑'].map((e, i) => (
                <div key={i} className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-3xl">{e}</div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-bold">Do'stlar</h3>
            <div className="grid grid-cols-4 gap-2">
              {['AK', 'MY', 'BE', 'S', 'N', 'J', 'SA', '+12'].map((a, i) => (
                <div key={i} className="flex aspect-square items-center justify-center">
                  {a.startsWith('+') ? <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-xs text-slate-500">{a}</div> : <Avatar name={a} size="md" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
