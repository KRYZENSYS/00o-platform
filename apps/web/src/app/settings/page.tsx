'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Bell, Shield, CreditCard, LogOut, Trash2, Moon, Sun, Globe, Lock, Eye, EyeOff, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/components/theme-provider';
import api from '@/lib/api';
import { getErrorMessage, cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'profile', l: 'Profil', i: User },
  { id: 'account', l: 'Akkaunt', i: Lock },
  { id: 'notifications', l: 'Bildirishnomalar', i: Bell },
  { id: 'premium', l: 'Premium', i: Sparkles },
  { id: 'privacy', l: 'Maxfiylik', i: Shield },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '', location: '', website: '',
    occupation: '', phone: '', username: '',
  });
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false, marketing: false });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        bio: user.bio || '', location: user.location || '', website: user.website || '',
        occupation: user.occupation || '', phone: user.phone || '', username: user.username || '',
      });
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.users.update(form);
      updateUser(res.data);
      setMessage({ type: 'ok', text: 'Saqlandi ✓' });
    } catch (e) {
      setMessage({ type: 'err', text: getErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pass.new !== pass.confirm) {
      setMessage({ type: 'err', text: 'Parollar mos kelmadi' });
      return;
    }
    try {
      await api.users.changePassword({ current: pass.current, new: pass.new });
      setMessage({ type: 'ok', text: 'Parol o\'zgartirildi ✓' });
      setPass({ current: '', new: '', confirm: '' });
    } catch (e) {
      setMessage({ type: 'err', text: getErrorMessage(e) });
    }
  };

  const doLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">Sozlamalar</h1>

      {message && (
        <div className={cn('mb-4 rounded-xl p-3 text-sm', message.type === 'ok' ? 'border border-green-500/20 bg-green-500/10 text-green-500' : 'border border-red-500/20 bg-red-500/10 text-red-500')}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-1 md:col-span-1">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={cn('flex w-full items-center justify-between rounded-xl p-3 text-left text-sm font-medium transition', active === s.id ? 'bg-violet-500/10 text-violet-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900')}>
              <div className="flex items-center gap-2"><s.i className="h-4 w-4" /> {s.l}</div>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
          <div className="my-3 h-px bg-slate-200 dark:bg-slate-800" />
          <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm font-medium text-red-500 hover:bg-red-500/10">
            <LogOut className="h-4 w-4" /> Chiqish
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2">
          {active === 'profile' && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Profil ma'lumotlari</h2>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-2xl font-bold text-white">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div>
                  <Button size="sm" variant="outline">Rasm yuklash</Button>
                  <p className="mt-1 text-xs text-slate-500">JPG, PNG, max 5MB</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Ism</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div><Label>Familiya</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                </div>
                <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} pattern="[a-zA-Z0-9_]+" /></div>
                <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={300} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Joylashuv</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Tashkent" /></div>
                  <div><Label>Kasb</Label><Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Frontend Developer" /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." /></div>
                  <div><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 ..." /></div>
                </div>
                <Button onClick={save} variant="gradient" loading={saving}><Save className="h-4 w-4" /> Saqlash</Button>
              </div>
            </Card>
          )}

          {active === 'account' && (
            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-bold">Parolni o'zgartirish</h2>
                <div className="space-y-3">
                  <div>
                    <Label>Joriy parol</Label>
                    <div className="relative">
                      <Input type={showPass ? 'text' : 'password'} value={pass.current} onChange={(e) => setPass({ ...pass, current: e.target.value })} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                  </div>
                  <div><Label>Yangi parol</Label><Input type="password" value={pass.new} onChange={(e) => setPass({ ...pass, new: e.target.value })} /></div>
                  <div><Label>Yangi parolni tasdiqlang</Label><Input type="password" value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} /></div>
                  <Button onClick={changePassword} variant="gradient">O'zgartirish</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="mb-2 text-lg font-bold">Tema</h2>
                <p className="mb-3 text-sm text-slate-500">Interfeys ko'rinishi</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'light', i: Sun, l: 'Yorug\'' },
                    { v: 'dark', i: Moon, l: 'Qorong\'i' },
                    { v: 'system', i: Globe, l: 'Tizim' },
                  ].map((t) => (
                    <button key={t.v} onClick={() => setTheme(t.v as any)} className={cn('flex flex-col items-center gap-1 rounded-xl border p-3 text-xs', theme === t.v ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-slate-800')}>
                      <t.i className="h-4 w-4" /> {t.l}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {active === 'notifications' && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Bildirishnomalar</h2>
              {Object.entries({ email: 'Email', push: 'Push (brauzer)', sms: 'SMS', marketing: 'Marketing xabarlari' }).map(([k, l]) => (
                <label key={k} className="mb-3 flex items-center justify-between">
                  <span className="text-sm">{l}</span>
                  <input type="checkbox" checked={(notifs as any)[k]} onChange={(e) => setNotifs({ ...notifs, [k]: e.target.checked })} className="h-5 w-5 rounded" />
                </label>
              ))}
              <Button variant="gradient" onClick={save}>Saqlash</Button>
            </Card>
          )}

          {active === 'premium' && (
            <Card className="overflow-hidden p-0">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 p-6 text-white">
                <Sparkles className="mb-2 h-8 w-8" />
                <h2 className="text-2xl font-bold">00o Pro</h2>
                <p className="text-sm opacity-90">Premium imkoniyatlarga ega bo'ling</p>
              </div>
              <div className="p-6">
                <p className="mb-1 text-3xl font-bold">99 000 so'm<span className="text-sm text-slate-500"> / oyiga</span></p>
                <ul className="my-4 space-y-2 text-sm">
                  <li>✅ 500 🪙 har oyda</li>
                  <li>✅ 100 AI so'rov / kun</li>
                  <li>✅ 5 startap</li>
                  <li>✅ Premium AI modellar</li>
                  <li>✅ Reklama yo'q</li>
                  <li>✅ Prioritet support</li>
                </ul>
                {user?.isPremium ? (
                  <Button variant="outline" fullWidth>Faol obuna</Button>
                ) : (
                  <Button variant="gradient" fullWidth>Pro ga o'tish</Button>
                )}
              </div>
            </Card>
          )}

          {active === 'privacy' && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold">Maxfiylik</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between"><span className="text-sm">Profilim ochiq</span><input type="checkbox" defaultChecked className="h-5 w-5" /></label>
                <label className="flex items-center justify-between"><span className="text-sm">Onlayn ko'rinish</span><input type="checkbox" defaultChecked className="h-5 w-5" /></label>
                <label className="flex items-center justify-between"><span className="text-sm">Faoliyatim ko'rinishi</span><input type="checkbox" className="h-5 w-5" /></label>
                <label className="flex items-center justify-between"><span className="text-sm">DM ga ruxsat</span><input type="checkbox" defaultChecked className="h-5 w-5" /></label>
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Akkauntni o'chirish</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
