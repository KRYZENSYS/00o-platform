'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Compass, Sparkles, Briefcase, Users, Rocket, DollarSign,
  MessageCircle, Bell, User, Settings, Crown, Search, LogOut,
  TrendingUp, Heart, BookOpen, BarChart3, ChevronLeft, ChevronRight,
  Plus,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Bosh sahifa', icon: Home, group: 'main' },
  { href: '/dashboard', label: 'Dashboard', icon: Compass, group: 'main' },
  { href: '/ai', label: 'AI Chat', icon: Sparkles, group: 'ai' },
  { href: '/startups', label: 'Startaplar', icon: Rocket, group: 'main' },
  { href: '/marketplace', label: 'Marketplace', icon: Briefcase, group: 'main' },
  { href: '/jobs', label: 'Ish o\'rinlari', icon: TrendingUp, group: 'main' },
  { href: '/investors', label: 'Investorlar', icon: DollarSign, group: 'main' },
  { href: '/team', label: 'Jamoa topish', icon: Users, group: 'main' },
  { href: '/feed', label: 'Feed', icon: Heart, group: 'social' },
  { href: '/chats', label: 'Xabarlar', icon: MessageCircle, group: 'social' },
  { href: '/notifications', label: 'Bildirishnomalar', icon: Bell, group: 'social' },
  { href: '/premium', label: 'Premium', icon: Crown, group: 'account' },
  { href: '/profile', label: 'Profil', icon: User, group: 'account' },
  { href: '/settings', label: 'Sozlamalar', icon: Settings, group: 'account' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Asosiy',
  ai: 'AI',
  social: 'Ijtimoiy',
  account: 'Akkaunt',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const groups = ['main', 'ai', 'social', 'account'];

  return (
    <aside className={cn(
      'sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 lg:block dark:border-slate-800 dark:bg-slate-950',
      collapsed ? 'w-20' : 'w-64'
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-base font-bold text-white">∞</div>
              <span className="text-lg font-bold">00o.uz</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 text-base font-bold text-white">∞</div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden xl:flex">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="border-b border-slate-200 p-3 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Qidirish..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {groups.map((g) => {
            const items = NAV.filter((n) => n.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g} className="mb-4">
                {!collapsed && (
                  <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{GROUP_LABELS[g]}</p>
                )}
                <div className="space-y-0.5">
                  {items.map((n) => {
                    const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-orange-500/10 text-violet-500'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900',
                          collapsed && 'justify-center'
                        )}
                        title={collapsed ? n.label : undefined}
                      >
                        <n.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{n.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User */}
        {isAuthenticated && user && (
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            {!collapsed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar name={user.username} size="sm" status="online" />
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-semibold">{user.firstName || user.username}</p>
                    <p className="truncate text-xs text-slate-500">@{user.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
                {user.tokens !== undefined && (
                  <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-2 py-1.5 text-xs">
                    <span className="font-semibold">🪙 {user.tokens}</span>
                    <Link href="/tokens" className="text-violet-500 hover:underline">+ Top up</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Avatar name={user.username} size="sm" />
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            {!collapsed ? (
              <div className="space-y-2">
                <Link href="/auth/login"><Button className="w-full" size="sm">Kirish</Button></Link>
                <Link href="/auth/register"><Button variant="outline" className="w-full" size="sm">Ro'yxatdan o'tish</Button></Link>
              </div>
            ) : (
              <Link href="/auth/login" className="block">
                <Button size="icon" className="w-full"><User className="h-4 w-4" /></Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: '/', label: 'Bosh', icon: Home },
    { href: '/ai', label: 'AI', icon: Sparkles },
    { href: '/startups', label: 'Startap', icon: Rocket },
    { href: '/feed', label: 'Feed', icon: Heart },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-around py-2">
        {items.map((n) => {
          const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] transition-all',
                active ? 'text-violet-500' : 'text-slate-500'
              )}
            >
              <n.icon className="h-5 w-5" />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
