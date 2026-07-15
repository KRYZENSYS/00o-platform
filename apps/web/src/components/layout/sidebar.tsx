'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, StickyNote, Target, Wallet, Activity, MessageCircle, User, BarChart3, Sparkles, Trophy, ShoppingBag, BookOpen, GamepadIcon, Image, QrCode, Cloud, Calculator, Languages, Bookmark, Timer, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: Home, group: 'main' },
  { href: '/todos', label: 'Vazifalar', icon: CheckSquare, group: 'productivity' },
  { href: '/notes', label: 'Eslatmalar', icon: StickyNote, group: 'productivity' },
  { href: '/habits', label: 'Odatlar', icon: Target, group: 'productivity' },
  { href: '/calendar', label: 'Kalendar', icon: Calendar, group: 'productivity' },
  { href: '/bookmarks', label: 'Xatcho\'plar', icon: Bookmark, group: 'productivity' },
  { href: '/feed', label: 'Lenta', icon: Home, group: 'social' },
  { href: '/chat', label: 'Xabarlar', icon: MessageCircle, group: 'social' },
  { href: '/contacts', label: 'Kontaktlar', icon: User, group: 'social' },
  { href: '/finance', label: 'Moliya', icon: Wallet, group: 'lifestyle' },
  { href: '/health', label: 'Sog\'liq', icon: Activity, group: 'lifestyle' },
  { href: '/store', label: 'Do\'kon', icon: ShoppingBag, group: 'lifestyle' },
  { href: '/media', label: 'Media', icon: Image, group: 'lifestyle' },
  { href: '/learn', label: 'O\'rganish', icon: BookOpen, group: 'education' },
  { href: '/games', label: 'O\'yinlar', icon: GamepadIcon, group: 'entertainment' },
  { href: '/weather', label: 'Ob-havo', icon: Cloud, group: 'tools' },
  { href: '/qr', label: 'QR Kod', icon: QrCode, group: 'tools' },
  { href: '/calc', label: 'Kalkulyator', icon: Calculator, group: 'tools' },
  { href: '/translate', label: 'Tarjimon', icon: Languages, group: 'tools' },
  { href: '/timer', label: 'Taymer', icon: Timer, group: 'tools' },
  { href: '/leaderboard', label: 'Liderlar', icon: BarChart3, group: 'gamification' },
  { href: '/achievements', label: 'Yutuqlar', icon: Trophy, group: 'gamification' },
  { href: '/premium', label: 'Premium', icon: Crown, group: 'account' },
  { href: '/profile', label: 'Profil', icon: User, group: 'account' },
];

const ICONS = { Calendar, GamepadIcon };

const GROUPS = [
  { id: 'main', label: '' },
  { id: 'productivity', label: 'Produktivlik' },
  { id: 'social', label: 'Ijtimoiy' },
  { id: 'lifestyle', label: 'Hayot tarzi' },
  { id: 'education', label: 'Ta\'lim' },
  { id: 'entertainment', label: 'Ko\'ngil ochar' },
  { id: 'tools', label: 'Vositalar' },
  { id: 'gamification', label: 'O\'yin' },
  { id: 'account', label: 'Akkaunt' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface/50 backdrop-blur-xl md:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold shadow-glow">∞</div>
          <span className="text-lg font-bold">00o.uz</span>
        </Link>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          {GROUPS.map((g) => {
            const items = MENU.filter((m) => m.group === g.id);
            if (items.length === 0) return null;
            return (
              <div key={g.id}>
                {g.label && <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{g.label}</p>}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all', isActive ? 'bg-gradient-to-r from-brand-500/20 to-pink-500/20 text-brand-500 font-semibold' : 'text-text-muted hover:bg-surface-2 hover:text-text')}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
