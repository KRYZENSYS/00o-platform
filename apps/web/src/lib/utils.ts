/**
 * Shared frontend utilities
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string, lang = 'uz') => {
  return new Intl.DateTimeFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatNumber = (n: number, lang = 'uz') =>
  new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US').format(n);

export const truncate = (text: string, n = 100) =>
  text.length > n ? text.slice(0, n) + '...' : text;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const copyToClipboard = async (text: string) => {
  if (typeof window === 'undefined') return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
