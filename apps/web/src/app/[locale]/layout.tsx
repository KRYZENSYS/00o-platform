'use client';
import { useEffect } from 'react';
import { Sidebar, MobileNav } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { useAuthStore } from '@/store/auth';
import { usePathname } from 'next/navigation';

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Auth pages: no sidebar
  const isAuthPage = pathname?.includes('/auth');
  const isLanding = pathname === '/' || pathname === '/uz' || pathname === '/en' || pathname === '/ru';

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (isLanding) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
