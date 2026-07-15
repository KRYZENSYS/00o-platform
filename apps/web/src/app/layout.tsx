import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: '00o.uz — O\'zbek platformasi', template: '%s | 00o.uz' },
  description: '50+ foydali ilova, ijtimoiy tarmoq, moliyaviy boshqaruv va ko\'p narsa bir joyda',
  keywords: ['00o.uz', 'platforma', 'o\'zbek', 'todo', 'moliya', 'ijtimoiy', 'AI', 'pro'],
  authors: [{ name: 'KRYZENSYS' }],
  creator: 'KRYZENSYS',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: '/',
    siteName: '00o.uz',
    title: '00o.uz — O\'zbek platformasi',
    description: '50+ foydali ilova bir joyda',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: '00o.uz', description: '50+ foydali ilova' },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#8b5cf6' }, { media: '(prefers-color-scheme: dark)', color: '#2e1065' }],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-mesh">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
