'use client';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute -right-20 top-20 h-72 w-72 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -left-20 bottom-20 h-72 w-72 animate-pulse rounded-full bg-pink-500/20 blur-3xl" />

      <div className="container relative mx-auto flex flex-col items-center justify-center px-4 py-8">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">
          <ArrowLeft className="h-4 w-4" /> Bosh sahifa
        </Link>
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black gradient-text">00o.uz</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
