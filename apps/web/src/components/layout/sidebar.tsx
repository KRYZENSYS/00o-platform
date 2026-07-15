'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, CheckSquare, StickyNote, Target, MessageCircle, User, Settings, Sparkles, Shield, Wallet, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';

const items = [
  { href: '/dashboard', icon: Home, key: 'home' },
  { href: '/feed', icon: MessageCircle, key: 'feed' },
  { href: '/todos', icon: CheckSquare, key: 'todos' },
  { href: '/notes', icon: StickyNote, key: 'notes' },
  { href: '/habits', icon: Target, key: 'habits' },
  { href: '/finance', icon: Wallet, key: 'finance' },
  { href: '/health', icon: Heart, key: 'health' },
  { href: '/chat', icon: MessageCircle, key: 'chat' },
  { href: '/premium', icon: Sparkles, key: 'premium' },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 border-r border-border bg-surface/50 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <Link href="/dashboard" className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold">∞</div>
          <span className="text-xl font-bold">00o.uz</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active ? 'bg-brand-500 text-white shadow-glow' : 'text-text-muted hover:bg-surface-2 hover:text-text'
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          {user?.role && ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
            <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-500 hover:bg-surface-2">
              <Shield className="h-4 w-4" /> {t('admin')}
            </Link>
          )}
          <Link href="/profile" className="mt-1 flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
            <Avatar src={user?.avatar} name={user?.displayName || user?.username || '?'} size="sm" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.displayName || user?.username}</p>
              <p className="truncate text-xs text-text-muted">@{user?.username}</p>
            </div>
            <Settings className="h-4 w-4 text-text-muted" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
