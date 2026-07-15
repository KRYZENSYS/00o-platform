'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Sparkles, Rocket, Briefcase, Users, DollarSign, MessageCircle,
  Bell, Settings, LogOut, Crown, Menu, X, Search, Plus, Compass, Coins
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: Home, exact: true },
  { href: '/ai', label: 'AI Chat', icon: Sparkles, badge: '5' },
  { href: '/startups', label: 'Startaplar', icon: Rocket },
  { href: '/marketplace', label: 'Marketplace', icon: Briefcase },
  { href: '/jobs', label: 'Ish o\'rinlari', icon: Users },
  { href: '/investors', label: 'Investorlar', icon: DollarSign },
  { href: '/chats', label: 'Chatlar', icon: MessageCircle },
  { href: '/feed', label: 'Feed', icon: Compass },
  { href: '/notifications', label: 'Bildirishnomalar', icon: Bell },
];

const BOTTOM_NAV = [
  { href: '/tokens', label: 'Tokenlar', icon: Coins },
  { href: '/premium', label: 'Premium', icon: Crown },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, clear } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) { router.replace('/auth/login'); return; }
      try {
        const r = await api.users.me();
        if (mounted) { setUser(r.data); setLoading(false); }
      } catch {
        try {
          const r2 = await api.auth.refresh();
          if (r2?.data?.access_token) {
            localStorage.setItem('access_token', r2.data.access_token);
            const r = await api.users.me();
            if (mounted) { setUser(r.data); setLoading(false); return; }
          }
        } catch { /* fall through */ }
        clear();
        router.replace('/auth/login');
      }
    })();
    return () => { mounted = false; };
  }, [router, setUser, clear]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname?.startsWith(href);

  const logout = async () => {
    try { await api.auth.logout(); } catch { /* noop */ }
    clear();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-black gradient-text">00o.uz</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <Link href="/profile" className="m-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
          <Avatar src={user?.avatar_url} alt={user?.first_name || 'U'} size="md" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{user?.first_name || 'Foydalanuvchi'} {user?.last_name || ''}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Coins className="h-3 w-3" /> {user?.tokens ?? 0} 🪙
              {user?.subscription_plan && user.subscription_plan !== 'free' && <Crown className="ml-1 h-3 w-3 text-amber-500" />}
            </div>
          </div>
        </Link>

        <div className="px-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" placeholder="Qidirish..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <div className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Asosiy</div>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition', isActive(n.href, n.exact) ? 'bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900')}>
              <n.icon className="h-4 w-4" />
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">{n.badge}</span>}
            </Link>
          ))}
          <div className="px-2 pb-1 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Boshqa</div>
          {BOTTOM_NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition', isActive(n.href) ? 'bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900')}>
              <n.icon className="h-4 w-4" />
              <span className="flex-1">{n.label}</span>
            </Link>
          ))}
          {user?.is_admin && (
            <Link href="/admin" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-600">
              <Crown className="h-4 w-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10">
            <LogOut className="h-4 w-4" /> Chiqish
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></button>
            <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
              Salom, {user?.first_name || 'Do\'st'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/startups/new" className="hidden sm:block"><Button size="sm" variant="gradient"><Plus className="h-4 w-4" /> Yaratish</Button></Link>
            <Link href="/notifications" className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </Link>
            <Link href="/profile" className="lg:hidden"><Avatar src={user?.avatar_url} alt={user?.first_name || 'U'} size="sm" /></Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
