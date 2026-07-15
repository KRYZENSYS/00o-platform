'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Rocket, Code, ShoppingBag, Briefcase, TrendingUp, Users, MessageCircle, User, CheckSquare, StickyNote, Wallet, Heart, BookOpen, Calendar, Timer, Calculator, Languages, GamepadIcon, Image as ImageIcon, Globe, Crown, MessageSquare, BarChart3, Crown as CrownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU = [
  { group: 'Asosiy', items: [{ href: '/dashboard', label: 'Bosh sahifa', icon: Home }]},
  { group: 'AI', items: [
    { href: '/ai', label: 'AI Chat', icon: Sparkles },
    { href: '/ai/ideas', label: 'Startup Ideas', icon: Rocket },
    { href: '/ai/code', label: 'Code AI', icon: Code },
    { href: '/ai/tools', label: 'Barcha AI', icon: BarChart3 },
  ]},
  { group: 'Startap & Frilans', items: [
    { href: '/startups', label: 'Startaplar', icon: Rocket },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/jobs', label: 'Ish o\'rinlari', icon: Briefcase },
    { href: '/investors', label: 'Investorlar', icon: TrendingUp },
    { href: '/team', label: 'Jamoa', icon: Users },
  ]},
  { group: 'Ijtimoiy', items: [
    { href: '/feed', label: 'Lenta', icon: MessageCircle },
    { href: '/chat', label: 'Xabarlar', icon: MessageSquare },
    { href: '/profile', label: 'Profil', icon: User },
  ]},
  { group: 'Vositalar', items: [
    { href: '/todos', label: 'Vazifalar', icon: CheckSquare },
    { href: '/notes', label: 'Eslatmalar', icon: StickyNote },
    { href: '/finance', label: 'Moliya', icon: Wallet },
    { href: '/health', label: 'Sog\'liq', icon: Heart },
    { href: '/learn', label: 'O\'rganish', icon: BookOpen },
    { href: '/calendar', label: 'Kalendar', icon: Calendar },
    { href: '/timer', label: 'Pomodoro', icon: Timer },
    { href: '/calc', label: 'Kalkulyator', icon: Calculator },
    { href: '/translate', label: 'Tarjimon', icon: Languages },
  ]},
  { group: 'Hobbi', items: [
    { href: '/games', label: 'O\'yinlar', icon: GamepadIcon },
    { href: '/movies', label: 'Kinolar', icon: ImageIcon },
    { href: '/travel', label: 'Sayohat', icon: Globe },
  ]},
  { group: 'Akkaunt', items: [
    { href: '/premium', label: 'Premium', icon: Crown },
    { href: '/settings', label: 'Sozlamalar', icon: User },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white/50 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50 md:block">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 font-bold text-white shadow-lg shadow-pink-500/30">∞</div>
        <span className="text-lg font-bold">00o.uz</span>
      </Link>

      <nav className="space-y-4">
        {MENU.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{g.group}</p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all', isActive ? 'bg-gradient-to-r from-violet-500/15 to-pink-500/15 font-semibold text-violet-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900')}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
