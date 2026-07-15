'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('oo_access');
      if (!hasToken) router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="container max-w-6xl py-6">{children}</div>
      </main>
    </div>
  );
}
