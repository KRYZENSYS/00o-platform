'use client';
import { CheckSquare, StickyNote, Target, Wallet, Activity, MessageCircle, Crown, Trophy, ShoppingBag, BookOpen, GamepadIcon, Image, QrCode, Cloud, Calculator, Languages, Bookmark, Timer, BarChart3, Stethoscope, Briefcase, Home as HomeIcon, Star } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const APPS = [
  { href: '/todos', label: 'Vazifalar', icon: CheckSquare, color: 'from-violet-500 to-purple-600' },
  { href: '/notes', label: 'Eslatmalar', icon: StickyNote, color: 'from-pink-500 to-rose-600' },
  { href: '/habits', label: 'Odatlar', icon: Target, color: 'from-orange-500 to-red-600' },
  { href: '/finance', label: 'Moliya', icon: Wallet, color: 'from-emerald-500 to-green-600' },
  { href: '/health', label: 'Sog\'liq', icon: Activity, color: 'from-cyan-500 to-blue-600' },
  { href: '/feed', label: 'Lenta', icon: MessageCircle, color: 'from-fuchsia-500 to-purple-600' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, color: 'from-indigo-500 to-violet-600' },
  { href: '/learn', label: 'O\'rganish', icon: BookOpen, color: 'from-amber-500 to-yellow-600' },
  { href: '/games', label: 'O\'yinlar', icon: GamepadIcon, color: 'from-red-500 to-pink-600' },
  { href: '/store', label: 'Do\'kon', icon: ShoppingBag, color: 'from-teal-500 to-cyan-600' },
  { href: '/media', label: 'Media', icon: Image, color: 'from-pink-500 to-purple-600' },
  { href: '/calendar', label: 'Kalendar', icon: HomeIcon, color: 'from-blue-500 to-indigo-600' },
  { href: '/contacts', label: 'Kontaktlar', icon: Star, color: 'from-violet-500 to-purple-600' },
  { href: '/bookmarks', label: 'Xatcho\'plar', icon: Bookmark, color: 'from-yellow-500 to-amber-600' },
  { href: '/weather', label: 'Ob-havo', icon: Cloud, color: 'from-sky-500 to-blue-600' },
  { href: '/qr', label: 'QR Kod', icon: QrCode, color: 'from-slate-500 to-slate-700' },
  { href: '/calc', label: 'Kalkulyator', icon: Calculator, color: 'from-emerald-500 to-teal-600' },
  { href: '/translate', label: 'Tarjimon', icon: Languages, color: 'from-blue-500 to-cyan-500' },
  { href: '/timer', label: 'Taymer', icon: Timer, color: 'from-rose-500 to-red-600' },
  { href: '/leaderboard', label: 'Liderlar', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
  { href: '/achievements', label: 'Yutuqlar', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
  { href: '/profile', label: 'Profil', icon: Star, color: 'from-pink-500 to-rose-500' },
  { href: '/premium', label: 'Premium', icon: Crown, color: 'from-amber-400 to-yellow-500' },
];

export default function HomePage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-500 via-pink-500 to-orange-500 p-8 text-white shadow-glow md:p-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3 w-3" /> 50+ ilova
          </span>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">Hayotning barchasi bir joyda</h1>
          <p className="mt-4 text-lg text-white/90">Vazifalar, moliya, sog\'liq, ta\'lim, o\'yinlar, ijtimoiy tarmoq — hammasi 00o.uz da</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition-transform hover:scale-105">Boshlash</Link>
            <Link href="/premium" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold backdrop-blur transition-transform hover:scale-105">Premium</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="text-center"><p className="text-3xl font-bold">50+</p><p className="text-sm text-text-muted">Ilovalar</p></Card>
        <Card className="text-center"><p className="text-3xl font-bold">10</p><p className="text-sm text-text-muted">Tillar</p></Card>
        <Card className="text-center"><p className="text-3xl font-bold">30+</p><p className="text-sm text-text-muted">Bot buyruqlar</p></Card>
        <Card className="text-center"><p className="text-3xl font-bold">∞</p><p className="text-sm text-text-muted">Imkoniyatlar</p></Card>
      </div>

      {/* All apps */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Barcha ilovalar</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {APPS.map((app) => (
            <Link key={app.href} href={app.href} className="group">
              <Card className="flex flex-col items-center p-4 transition-all hover:scale-105 hover:shadow-glow">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:rotate-6', app.color)}>
                  <app.icon className="h-6 w-6" />
                </div>
                <p className="mt-2 text-center text-xs font-medium">{app.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10">
          <h3 className="text-lg font-bold">📋 Produktivlik</h3>
          <p className="mt-1 text-sm text-text-muted">Vazifalar, eslatmalar, odatlar, taymer</p>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-rose-500/10">
          <h3 className="text-lg font-bold">💬 Ijtimoiy</h3>
          <p className="mt-1 text-sm text-text-muted">Lenta, chat, kontaktlar</p>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10">
          <h3 className="text-lg font-bold">💰 Moliya</h3>
          <p className="mt-1 text-sm text-text-muted">Tranzaksiyalar, statistika</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <h3 className="text-lg font-bold">🎮 O'yin</h3>
          <p className="mt-1 text-sm text-text-muted">O'yinlar, yutuqlar, liderlar</p>
        </Card>
      </div>
    </div>
  );
}
