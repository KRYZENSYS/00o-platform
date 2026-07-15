// 00o.uz - i18n configuration
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['uz', 'ru', 'en', 'tr', 'kk', 'ky', 'tg', 'az', 'ar', 'fa'] as const;
export const defaultLocale = 'uz' as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Tashkent',
    now: new Date(),
  };
});
