'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket, MapPin, Globe, Users, Heart, Share2, MessageCircle, Eye, Sparkles, TrendingUp, Plus, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StartupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [startup, setStartup] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.allSettled([api.startups.get(id), api.startups.team(id)])
      .then(([s, t]) => {
        if (s.status === 'fulfilled') { setStartup(s.value.data); setLiked(!!s.value.data?.liked); }
        if (t.status === 'fulfilled') setTeam(t.value.data?.items || t.value.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const like = async () => {
    setLiked(!liked);
    setStartup({ ...startup, likes: (startup.likes || 0) + (liked ? -1 : 1) });
    try { await api.startups.like(id); } catch { /* ignore */ }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  if (!startup) return <div className="text-center text-sm text-slate-500">Startap topilmadi</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Orqaga</button>

      <Card>
        <div className="h-40 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500" />
        <CardContent className="relative p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-16 flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-xl ring-4 ring-white dark:ring-slate-950">
                <Rocket className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-3xl font-black">{startup.name}</h1>
                <p className="text-slate-500">{startup.tagline}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {startup.industry && <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-900">{startup.industry}</span>}
                  {startup.stage && <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-500">{startup.stage}</span>}
                  {startup.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {startup.location}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={like} className={cn(liked && 'border-pink-500 bg-pink-500/10 text-pink-500')}>
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} /> {startup.likes || 0}
              </Button>
              <Button variant="outline"><Share2 className="h-4 w-4" /> Ulashish</Button>
              <Button variant="gradient"><MessageCircle className="h-4 w-4" /> Murojaat</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: 'Ko\'rishlar', v: startup.views || 0, i: Eye },
              { l: 'Jamoa', v: team.length || startup.team_size || 0, i: Users },
              { l: 'Likes', v: startup.likes || 0, i: Heart },
              { l: 'Funding', v: startup.funding_goal ? `$${startup.funding_goal.toLocaleString()}` : '—', i: TrendingUp },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
                <s.i className="mx-auto h-4 w-4 text-violet-500" />
                <div className="text-lg font-black">{s.v}</div>
                <div className="text-[10px] text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Batafsil</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{startup.description || 'Tavsif mavjud emas'}</p>
            </CardContent>
          </Card>

          {startup.tags?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Teglar</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {startup.tags.map((t: string) => <span key={t} className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-500">#{t}</span>)}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Jamoa ({team.length})</span>
                <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> Qo\'shish</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <p className="text-sm text-slate-500">Jamoa a\'zolari yo\'q</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {team.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <Avatar src={m.user?.avatar_url} alt={m.user?.first_name || 'U'} />
                      <div>
                        <div className="text-sm font-bold">{m.user?.first_name} {m.user?.last_name || ''}</div>
                        <div className="text-xs text-slate-500">{m.role}</div>
                      </div>
                      {m.role === 'founder' && <Crown className="ml-auto h-4 w-4 text-amber-500" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {startup.website_url && (
            <Card>
              <CardHeader><CardTitle>Websayt</CardTitle></CardHeader>
              <CardContent>
                <a href={startup.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-violet-500 hover:underline">
                  <Globe className="h-4 w-4" /> {startup.website_url}
                </a>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-orange-500/10 border-violet-500/20">
            <CardContent className="p-5">
              <Sparkles className="h-6 w-6 text-violet-500" />
              <h3 className="mt-2 font-bold">Bu startap sizga mosmi?</h3>
              <p className="mt-1 text-xs text-slate-500">Murojaat qiling yoki investitsiya qiling</p>
              <Button variant="gradient" fullWidth className="mt-3"><MessageCircle className="h-4 w-4" /> Murojaat</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
