'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Locale = 'uz' | 'ru' | 'en';
const translations: Record<Locale, Record<string, string>> = {
  uz: {
    'app.name': '00o.uz',
    'nav.home': 'Bosh sahifa',
    'nav.ai': 'AI',
    'nav.startups': 'Startaplar',
    'nav.marketplace': 'Marketplace',
    'nav.jobs': 'Ish',
    'nav.investors': 'Investorlar',
    'nav.feed': 'Feed',
    'nav.chats': 'Xabarlar',
    'common.loading': 'Yuklanmoqda...',
    'common.error': 'Xatolik yuz berdi',
  },
  ru: {
    'app.name': '00o.uz',
    'nav.home': 'Главная',
    'nav.ai': 'AI',
    'nav.startups': 'Стартапы',
    'nav.marketplace': 'Маркетплейс',
    'nav.jobs': 'Работа',
    'nav.investors': 'Инвесторы',
    'nav.feed': 'Лента',
    'nav.chats': 'Сообщения',
    'common.loading': 'Загрузка...',
    'common.error': 'Произошла ошибка',
  },
  en: {
    'app.name': '00o.uz',
    'nav.home': 'Home',
    'nav.ai': 'AI',
    'nav.startups': 'Startups',
    'nav.marketplace': 'Marketplace',
    'nav.jobs': 'Jobs',
    'nav.investors': 'Investors',
    'nav.feed': 'Feed',
    'nav.chats': 'Messages',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'uz',
  setLocale: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uz');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('locale')) as Locale | null;
    if (saved && ['uz', 'ru', 'en'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', l);
      document.documentElement.lang = l;
    }
  };

  const t = (key: string) => translations[locale]?.[key] || key;

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
