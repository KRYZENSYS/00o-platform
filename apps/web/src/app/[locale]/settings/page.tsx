'use client';
import { useState } from 'react';
import { User, Bell, Lock, CreditCard, Globe, Moon, Sun, Languages, Shield, Trash2, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
  { id: 'security', label: 'Xavfsizlik', icon: Lock },
  { id: 'billing', label: 'To\'lov', icon: CreditCard },
  { id: 'appearance', label: 'Ko\'rinish', icon: Moon },
  { id: 'language', label: 'Til', icon: Languages },
  { id: 'privacy', label: 'Maxfiylik', icon: Shield },
];

export default function SettingsPage() {
  const [section, setSection] = useState('profile');
  const [loading, setLoading] = useState(false);

  const save = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); toast.success('Saqlandi!'); }, 800);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Sozlamalar ⚙️</h1>
        <p className="text-sm text-slate-500">Akkauntingizni boshqaring</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-1">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)} className={cn('flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all', section === s.id ? 'bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-violet-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800')}>
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4 lg:col-span-3">
          {section === 'profile' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Profil ma'lumotlari</h2>
              <div className="flex items-center gap-4">
                <Avatar name="You" size="xl" />
                <div>
                  <Button size="sm" variant="outline">Rasm yuklash</Button>
                  <p className="mt-2 text-xs text-slate-500">PNG, JPG • Max 5MB</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[{ l: 'Ism', v: '' }, { l: 'Familiya', v: '' }, { l: 'Username', v: '' }, { l: 'Email', v: '' }].map((f) => (
                  <div key={f.l}>
                    <label className="mb-1.5 block text-sm font-medium">{f.l}</label>
                    <input defaultValue={f.v} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" placeholder={f.l} />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium">Bio</label>
                <textarea rows={3} placeholder="O'zingiz haqingizda..." className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={save} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Saqlash</>}</Button>
              </div>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Bildirishnomalar</h2>
              {[
                { l: 'Email bildirishnomalar', d: 'Muhim yangiliklar email orqali', on: true },
                { l: 'Push bildirishnomalar', d: 'Brauzer bildirishnomalar', on: true },
                { l: 'Yangi follow', d: 'Kimdir sizni follow qilganda', on: true },
                { l: 'Like va comment', d: 'Postlaringizga like va comment', on: true },
                { l: 'Xabarlar', d: 'Yangi xabarlar haqida', on: true },
                { l: 'Marketing', d: 'Yangiliklar va takliflar', on: false },
                { l: 'AI javob tayyor', d: 'AI so\'rovlar tugaganda', on: true },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium">{n.l}</p>
                    <p className="text-xs text-slate-500">{n.d}</p>
                  </div>
                  <button className={cn('relative h-6 w-11 rounded-full transition-colors', n.on ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-slate-300 dark:bg-slate-700')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', n.on ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </Card>
          )}

          {section === 'security' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Xavfsizlik</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start"><Lock className="h-4 w-4" /> Parolni o'zgartirish</Button>
                <Button variant="outline" className="w-full justify-start"><Shield className="h-4 w-4" /> 2FA yoqish</Button>
                <Button variant="outline" className="w-full justify-start"><Phone className="h-4 w-4" /> Telefon qo'shish</Button>
                <Button variant="outline" className="w-full justify-start"><Mail className="h-4 w-4" /> Email tasdiqlash</Button>
                <hr className="my-4 border-slate-200 dark:border-slate-800" />
                <Button variant="outline" className="w-full justify-start text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /> Akkauntni o'chirish</Button>
              </div>
            </Card>
          )}

          {section === 'billing' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">To'lov va tarif</h2>
              <div className="mb-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 p-4">
                <p className="text-sm text-slate-500">Joriy tarif</p>
                <p className="text-2xl font-bold">Free</p>
                <p className="mt-1 text-xs text-slate-500">10 ta AI so'rov qoldi</p>
                <Button size="sm" className="mt-3">Pro ga o'tish</Button>
              </div>
              <h3 className="mb-2 font-semibold">Token balans</h3>
              <p className="text-3xl font-bold text-violet-500">0 🪙</p>
              <Button variant="outline" className="mt-3 w-full">Token sotib olish</Button>
            </Card>
          )}

          {section === 'appearance' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Ko'rinish</h2>
              <p className="mb-3 text-sm text-slate-500">Mavzu</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ l: 'Yorug\'', i: Sun, c: 'bg-white' }, { l: 'Qorong\'i', i: Moon, c: 'bg-slate-900' }, { l: 'Tizim', i: Globe, c: 'bg-gradient-to-br from-white to-slate-900' }].map((t, i) => (
                  <button key={i} className={cn('flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 p-4 transition-all hover:border-violet-500 dark:border-slate-800', i === 0 && 'border-violet-500')}>
                    <div className={cn('h-16 w-full rounded-lg', t.c)} />
                    <span className="text-xs font-medium"><t.i className="mr-1 inline h-3 w-3" />{t.l}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {section === 'language' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Til</h2>
              <div className="space-y-2">
                {[{ c: 'uz', l: 'O\'zbek', f: '🇺🇿' }, { c: 'en', l: 'English', f: '🇬🇧' }, { c: 'ru', l: 'Русский', f: '🇷🇺' }].map((l, i) => (
                  <button key={l.c} className={cn('flex w-full items-center justify-between rounded-xl border p-3 transition-all', i === 0 ? 'border-violet-500 bg-violet-500/5' : 'border-slate-200 hover:border-violet-300 dark:border-slate-800')}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{l.f}</span>
                      <span className="font-medium">{l.l}</span>
                    </div>
                    {i === 0 && <Check className="h-4 w-4 text-violet-500" />}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {section === 'privacy' && (
            <Card>
              <h2 className="mb-4 text-lg font-bold">Maxfiylik</h2>
              {[
                { l: 'Profilim hammaga ochiq', d: 'Boshqa foydalanuvchilar ko\'ra oladi', on: true },
                { l: 'Onlayn status', d: 'Boshqalar sizning onlayn ekanligingizni ko\'ra oladi', on: true },
                { l: 'Xabarlar faqat followerlardan', d: 'Begona odamlar xabar yubora olmaydi', on: false },
                { l: 'AI training', d: 'Sizning suhbatlaringiz AI ni o\'qitish uchun ishlatiladi', on: false },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium">{p.l}</p>
                    <p className="text-xs text-slate-500">{p.d}</p>
                  </div>
                  <button className={cn('relative h-6 w-11 rounded-full transition-colors', p.on ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-slate-300 dark:bg-slate-700')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', p.on ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
