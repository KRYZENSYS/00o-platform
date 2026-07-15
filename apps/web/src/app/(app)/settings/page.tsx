'use client';
import { useEffect, useState } from 'react';
import { Save, Lock, Bell, Globe, Palette, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [tab, setTab] = useState('account');
  const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });
  const [prefs, setPrefs] = useState<any>({ language: 'uz', theme: 'system', notifications_email: true, notifications_push: true, notifications_telegram: false, profile_public: true });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.users.preferences().then((r) => { if (r.data) setPrefs({ ...prefs, ...r.data }); }).catch(() => {});
  }, []);

  const savePrefs = async () => {
    setLoading(true); setMsg('');
    try {
      await api.users.updatePreferences(prefs);
      setMsg('Saqlandi ✓');
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Xatolik'); }
    finally { setLoading(false); }
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.new !== pwd.confirm) { setMsg('Parollar mos kelmayapti'); return; }
    setLoading(true); setMsg('');
    try {
      await api.users.changePassword({ current_password: pwd.current, new_password: pwd.new });
      setMsg('Parol o\'zgartirildi ✓');
      setPwd({ current: '', new: '', confirm: '' });
    } catch (e: any) { setMsg(e?.response?.data?.detail || 'Xatolik'); }
    finally { setLoading(false); }
  };

  const TABS = [
    { id: 'account', label: 'Hisob', icon: Lock },
    { id: 'preferences', label: 'Sozlamalar', icon: Palette },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'language', label: 'Til', icon: Globe },
    { id: 'danger', label: 'Xavfli zona', icon: Trash2 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-black">Sozlamalar</h1>

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition', tab === t.id ? 'bg-violet-500/10 text-violet-600' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900')}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {tab === 'account' && (
            <Card>
              <CardHeader><CardTitle>Parolni o\'zgartirish</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={changePwd} className="space-y-3">
                  <div><Label>Joriy parol</Label><Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} required /></div>
                  <div><Label>Yangi parol</Label><Input type="password" value={pwd.new} onChange={(e) => setPwd({ ...pwd, new: e.target.value })} minLength={8} required /></div>
                  <div><Label>Tasdiqlash</Label><Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required /></div>
                  <Button type="submit" variant="gradient" loading={loading}><Save className="h-4 w-4" /> O\'zgartirish</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === 'preferences' && (
            <Card>
              <CardHeader><CardTitle>Umumiy sozlamalar</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Mavzu</Label>
                  <select value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })} className="input">
                    <option value="system">Tizim</option><option value="light">Yorug\'</option><option value="dark">Qorong\'u</option>
                  </select>
                </div>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <span>Profil ochiq</span>
                  <input type="checkbox" checked={prefs.profile_public} onChange={(e) => setPrefs({ ...prefs, profile_public: e.target.checked })} className="h-4 w-4" />
                </label>
                <Button onClick={savePrefs} variant="gradient" loading={loading}><Save className="h-4 w-4" /> Saqlash</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardHeader><CardTitle>Bildirishnomalar</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { k: 'notifications_email', l: 'Email bildirishnomalar' },
                  { k: 'notifications_push', l: 'Push bildirishnomalar' },
                  { k: 'notifications_telegram', l: 'Telegram bildirishnomalar' },
                ].map((n) => (
                  <label key={n.k} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <span>{n.l}</span>
                    <input type="checkbox" checked={prefs[n.k]} onChange={(e) => setPrefs({ ...prefs, [n.k]: e.target.checked })} className="h-4 w-4" />
                  </label>
                ))}
                <Button onClick={savePrefs} variant="gradient" loading={loading}><Save className="h-4 w-4" /> Saqlash</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'language' && (
            <Card>
              <CardHeader><CardTitle>Til</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { v: 'uz', l: '🇺🇿 O\'zbek' },
                  { v: 'ru', l: '🇷🇺 Русский' },
                  { v: 'en', l: '🇬🇧 English' },
                ].map((lng) => (
                  <button key={lng.v} onClick={() => setPrefs({ ...prefs, language: lng.v })} className={cn('flex w-full items-center gap-2 rounded-xl border p-3 transition', prefs.language === lng.v ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-slate-800')}>
                    <span className="text-lg">{lng.l}</span>
                    {prefs.language === lng.v && <span className="ml-auto text-violet-500">✓</span>}
                  </button>
                ))}
                <Button onClick={savePrefs} variant="gradient" loading={loading}><Save className="h-4 w-4" /> Saqlash</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'danger' && (
            <Card className="border-red-500/30">
              <CardHeader><CardTitle className="text-red-500">Xavfli zona</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500">Bu amallar qaytarilmas. Ehtiyot bo\'ling.</p>
                <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => { if (confirm('Haqiqatan hisobni o\'chirmoqchimisiz?')) api.users.deleteMe().then(() => { localStorage.clear(); window.location.href = '/'; }); }}><Trash2 className="h-4 w-4" /> Hisobni o\'chirish</Button>
              </CardContent>
            </Card>
          )}

          {msg && <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
