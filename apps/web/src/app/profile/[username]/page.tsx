'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Link as LinkIcon, Users, Rocket, Sparkles, Edit, MessageCircle, UserPlus, UserCheck, Award, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatNumber, formatRelative, cn } from '@/lib/utils';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: me, updateUser } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [startups, setStartups] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'startups' | 'services' | 'posts' | 'about'>('startups');

  const username = params?.username as string;
  const isMe = me?.username === username;

  useEffect(() => {
    if (username) load();
  }, [username]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.users.getByUsername(username);
      setUser(res.data);
      // Load user's content
      const [s, sv] = await Promise.allSettled([
        api.startups.list({ userId: res.data.id, limit: 12 }),
        api.marketplace.services({ userId: res.data.id, limit: 12 }),
      ]);
      if (s.status === 'fulfilled') setStartups(s.value.data || []);
      if (sv.status === 'fulfilled') setServices(sv.value.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const follow = async () => {
    if (!user) return;
    try {
      const res = await api.users.follow(user.id);
      setUser({ ...user, isFollowing: res.data.following, followersCount: res.data.followersCount });
    } catch (e) { /* ignore */ }
  };

  if (loading || !user) {
    return <div className="p-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      {/* Cover */}
      <div className="relative">
        <div className="h-48 rounded-3xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 md:h-64" />

        <div className="-mt-16 flex flex-col gap-4 px-4 md:-mt-20 md:flex-row md:items-end md:justify-between md:px-6">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-500 to-pink-500 text-3xl font-bold text-white shadow-xl dark:border-slate-950 md:h-32 md:w-32">
              {user.avatar ? <img src={user.avatar} className="h-full w-full rounded-2xl object-cover" /> : (user.firstName?.[0] || user.username?.[0])}
            </div>
            <div className="md:pb-2">
              <h1 className="text-2xl font-bold md:text-3xl">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-slate-500">@{user.username} {user.isPremium && <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white"><Award className="h-2.5 w-2.5" /> PRO</span>}</p>
              {user.bio && <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{user.bio}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {user.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.location}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatRelative(user.createdAt)} qo'shildi</span>
                {user.website && <a href={user.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-violet-500 hover:underline"><LinkIcon className="h-3 w-3" /> {user.website}</a>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:pb-2">
            {isMe ? (
              <Link href="/settings"><Button variant="outline"><Edit className="h-4 w-4" /> Tahrirlash</Button></Link>
            ) : (
              <>
                <Button onClick={follow} variant={user.isFollowing ? 'outline' : 'gradient'}>
                  {user.isFollowing ? <><UserCheck className="h-4 w-4" /> Obuna bo'lingan</> : <><UserPlus className="h-4 w-4" /> Obuna bo'lish</>}
                </Button>
                <Link href={`/chats?to=${user.id}`}><Button variant="outline"><MessageCircle className="h-4 w-4" /></Button></Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { l: 'Obunachilar', v: formatNumber(user.followersCount || 0) },
          { l: 'Obunalar', v: formatNumber(user.followingCount || 0) },
          { l: 'Startaplar', v: formatNumber(user.startupsCount || 0) },
          { l: 'Xizmatlar', v: formatNumber(user.servicesCount || 0) },
          { l: 'XP / Level', v: `${user.xp || 0} / ${user.level || 'Bronze'}` },
        ].map((s) => (
          <Card key={s.l} className="p-3 text-center">
            <div className="text-lg font-bold">{s.v}</div>
            <div className="text-xs text-slate-500">{s.l}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'startups', l: 'Startaplar', i: Rocket },
          { id: 'services', l: 'Xizmatlar', i: Briefcase },
          { id: 'posts', l: 'Postlar', i: Sparkles },
          { id: 'about', l: 'Haqida', i: Users },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={cn('flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition', tab === t.id ? 'border-violet-500 text-violet-500' : 'border-transparent text-slate-500 hover:text-slate-900')}>
            <t.i className="h-3.5 w-3.5" /> {t.l}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'startups' && (
          startups.length === 0 ? (
            <div className="py-20 text-center text-slate-500">Startaplar yo'q</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((s) => (
                <Link key={s.id} href={`/startups/${s.slug}`}>
                  <Card className="p-4 transition hover:shadow-lg">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white">{s.name?.[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.stage}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">{s.tagline || s.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )
        )}
        {tab === 'services' && (
          services.length === 0 ? (
            <div className="py-20 text-center text-slate-500">Xizmatlar yo'q</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link key={s.id} href={`/marketplace/${s.id}`}>
                  <Card className="p-4 transition hover:shadow-lg">
                    <p className="line-clamp-1 text-sm font-bold">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{s.description}</p>
                    <p className="mt-2 text-sm font-bold text-violet-500">{formatNumber(s.price)} {s.currency}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )
        )}
        {tab === 'posts' && (
          <div className="py-20 text-center text-slate-500">Postlar tez orada</div>
        )}
        {tab === 'about' && (
          <Card className="p-6">
            <h3 className="mb-3 text-lg font-bold">Haqida</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Bio:</strong> {user.bio || '—'}</p>
              <p><strong>Joylashuv:</strong> {user.location || '—'}</p>
              <p><strong>Kasb:</strong> {user.occupation || '—'}</p>
              <p><strong>Website:</strong> {user.website || '—'}</p>
              <p><strong>Roll:</strong> {user.role}</p>
              <p><strong>Premium:</strong> {user.isPremium ? '✅ Ha' : '❌ Yo\'q'}</p>
              <p><strong>Tokenlar:</strong> {formatNumber(user.tokens || 0)} 🪙</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
