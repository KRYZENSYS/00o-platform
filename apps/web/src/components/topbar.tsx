'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Globe, ChevronDown, LogOut, Settings, User, Crown, Coins } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ai': 'AI Chat',
  '/ai/tools': 'AI Vositalar',
  '/startups': 'Startaplar',
  '/startups/new': 'Yangi startap',
  '/marketplace': 'Marketplace',
  '/jobs': 'Ish o\'rinlari',
  '/investors': 'Investorlar',
  '/team': 'Jamoa topish',
  '/feed': 'Feed',
  '/chats': 'Xabarlar',
  '/notifications': 'Bildirishnomalar',
  '/premium': 'Premium',
  '/profile': 'Profil',
  '/settings': 'Sozlamalar',
  '/tokens': 'Tokenlar',
  '/calendar': 'Kalendar',
  '/todos': 'Vazifalar',
  '/notes': 'Eslatmalar',
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname?.startsWith(path))?.[1] || '00o.uz';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold md:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input placeholder="Qidirish..." className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 lg:w-64" />
        </div>

        {/* Tokens */}
        {isAuthenticated && user && (
          <Link href="/tokens" className="hidden items-center gap-1 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-3 py-1.5 text-sm font-semibold text-violet-500 hover:opacity-80 md:flex">
            <Coins className="h-3.5 w-3.5" /> {user.tokens || 0}
          </Link>
        )}

        {/* Theme toggle */}
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        {/* Language */}
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowNotif(!showNotif)}>
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Bildirishnomalar</h3>
              <div className="space-y-2">
                {[
                  { i: '🚀', t: 'Yangi startap yaratildi', s: '5 daqiqa oldin' },
                  { i: '💎', t: 'Premium faollashtirildi', s: '1 soat oldin' },
                  { i: '👥', t: 'Yangi follower', s: '2 soat oldin' },
                ].map((n, i) => (
                  <button key={i} className="flex w-full items-start gap-2 rounded-xl p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900">
                    <span className="text-xl">{n.i}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.t}</p>
                      <p className="text-xs text-slate-500">{n.s}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900">
              <Avatar name={user.username} size="sm" />
              <ChevronDown className="hidden h-3 w-3 md:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{user.firstName || user.username}</p>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                </div>
                <hr className="my-1 border-slate-200 dark:border-slate-800" />
                <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                  <User className="h-4 w-4" /> Profil
                </Link>
                <Link href="/premium" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Crown className="h-4 w-4" /> Premium
                </Link>
                <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Settings className="h-4 w-4" /> Sozlamalar
                </Link>
                <hr className="my-1 border-slate-200 dark:border-slate-800" />
                <button onClick={() => logout()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10">
                  <LogOut className="h-4 w-4" /> Chiqish
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login"><Button size="sm">Kirish</Button></Link>
        )}
      </div>
    </header>
  );
}
