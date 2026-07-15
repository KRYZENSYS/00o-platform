import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: '00o.uz — AI Startup Hub',
  description: 'O\'zbekistondagi eng katta AI startup va frilanser platformasi. Startaplar, frilanserlar, investorlar bir joyda.',
  keywords: ['startup', 'AI', 'frilanser', 'O\'zbekiston', 'investitsiya', 'marketplace'],
  authors: [{ name: '00o.uz' }],
  openGraph: {
    title: '00o.uz — AI Startup Hub',
    description: 'Startaplar, frilanserlar va investorlar uchun AI platforma',
    type: 'website',
    locale: 'uz_UZ',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
