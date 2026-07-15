'use client';
import { Bell, Search, Sun, Moon, Globe, MessageSquare, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const LANGS = [{ code: 'uz', label: 'O\'zbek', flag: '🇺🇿' }, { code: 'en', label: 'English', flag: '🇬🇧' }, { code: 'ru', label: 'Русский', flag: '🇷🇺' }];

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [openLang, setOpenLang] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" placeholder="Qidirish..." className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 pl-10 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setOpenLang(!openLang)} className="flex h-9 items-center gap-1 rounded-lg px-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
              <Globe className="h-4 w-4" /> <span className="hidden sm:inline">🇺🇿</span>
            </button>
            {openLang && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => setOpenLang(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button onClick={() => router.push('/chat')} className="hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 md:flex dark:hover:bg-slate-900">
            <MessageSquare className="h-4 w-4" />
          </button>

          <div className="relative">
            <button onClick={() => setOpenNotif(!openNotif)} className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            {openNotif && (
              <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between p-2">
                  <h3 className="font-semibold">Bildirishnomalar</h3>
                  <button className="text-xs text-violet-500">Hammasini o'qish</button>
                </div>
                {[{ who: 'Aziz', action: 'postingizga like bosdi', time: '5 daq' }, { who: 'Malika', action: 'sizni follow qildi', time: '1 soat' }, { who: 'AI', action: 'resume tayyor', time: '2 soat' }].map((n, i) => (
                  <button key={i} className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-900">
                    <Avatar name={n.who} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm"><span className="font-semibold">{n.who}</span> {n.action}</p>
                      <p className="text-xs text-slate-500">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative ml-2">
            <button onClick={() => setOpenMenu(!openMenu)} className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-900">
              <Avatar name={user?.username || 'U'} size="sm" />
              <ChevronDown className="hidden h-3 w-3 sm:block" />
            </button>
            {openMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 p-3 dark:border-slate-800">
                  <p className="font-semibold">{user?.firstName || user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button onClick={() => router.push('/profile')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"><User className="h-4 w-4" /> Profil</button>
                <button onClick={() => router.push('/settings')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"><Settings className="h-4 w-4" /> Sozlamalar</button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"><HelpCircle className="h-4 w-4" /> Yordam</button>
                <hr className="my-1 border-slate-200 dark:border-slate-800" />
                <button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Chiqish</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
