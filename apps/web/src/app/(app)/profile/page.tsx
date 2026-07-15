'use client';
import { useEffect, useState } from 'react';
import { Camera, Save, MapPin, Briefcase, Globe, Github, Twitter, Linkedin, Edit, Crown, Coins, TrendingUp, Rocket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website_url: user.website_url || '',
        github_url: user.github_url || '',
        twitter_url: user.twitter_url || '',
        linkedin_url: user.linkedin_url || '',
        skills: (user.skills || []).join(', '),
        occupation: user.occupation || '',
        company: user.company || '',
      });
    }
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const payload = { ...form, skills: typeof form.skills === 'string' ? form.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : form.skills };
      const r = await api.users.updateMe(payload);
      setUser({ ...user, ...r.data });
      setMsg('Saqlandi ✓');
      setTimeout(() => setMsg(''), 2000);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Xatolik yuz berdi');
    }
    finally { setSaving(false); }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.uploads.avatar(fd);
      setUser({ ...user, avatar_url: r.data?.url || r.data?.avatar_url });
    } catch { /* ignore */ }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Cover */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500" />
        <CardContent className="relative p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-16 flex items-end gap-4">
              <div className="relative">
                <Avatar src={user.avatar_url} alt={user.first_name || 'U'} size="xl" className="h-24 w-24 ring-4 ring-white dark:ring-slate-950" />
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-violet-500 p-1.5 text-white shadow-lg hover:bg-violet-600">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-black">{user.first_name} {user.last_name}</h1>
                <p className="text-sm text-slate-500">@{user.username || 'user'}</p>
              </div>
            </div>
            {user.subscription_plan && user.subscription_plan !== 'free' && (
              <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                <Crown className="h-3 w-3" /> {user.subscription_plan.toUpperCase()}
              </div>
            )}
          </div>
          {/* Stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            {[
              { v: user.tokens || 0, l: 'Token', i: Coins, c: 'text-amber-500' },
              { v: user.startups_count || 0, l: 'Startap', i: Rocket, c: 'text-pink-500' },
              { v: user.followers_count || 0, l: 'Obunachi', i: Users, c: 'text-blue-500' },
              { v: user.ai_requests || 0, l: 'AI', i: TrendingUp, c: 'text-violet-500' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <s.i className={cn('mx-auto h-4 w-4', s.c)} />
                <div className="text-lg font-black">{s.v}</div>
                <div className="text-[10px] text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={save}>
        <Card>
          <CardHeader><CardTitle>Asosiy ma\'lumot</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Ism</Label><Input value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Familiya</Label><Input value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
            </div>
            <div><Label>Username</Label><Input value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={500} /></div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle>Kontakt</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Joylashuv</Label><Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Toshkent" /></div>
              <div><Label>Kasb</Label><Input value={form.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Full-stack developer" /></div>
              <div><Label>Kompaniya</Label><Input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Website</Label><Input type="url" value={form.website_url || ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
              <div><Label>GitHub</Label><Input value={form.github_url || ''} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." /></div>
              <div><Label>Twitter</Label><Input value={form.twitter_url || ''} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader><CardTitle>Ko\'nikmalar</CardTitle></CardHeader>
          <CardContent>
            <Label>Skill (vergul bilan)</Label>
            <Input value={form.skills || ''} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, AI, Marketing" />
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          {msg && <span className="text-sm text-green-500">{msg}</span>}
          <Button type="submit" variant="gradient" loading={saving} className="ml-auto"><Save className="h-4 w-4" /> Saqlash</Button>
        </div>
      </form>
    </div>
  );
}

function cn(...args: any[]) { return args.filter(Boolean).join(' '); }
