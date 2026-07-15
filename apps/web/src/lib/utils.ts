// Utility functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number | undefined | null): string {
  if (n == null) return '0';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

export function formatCurrency(n: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' ' + currency;
}

export function formatRelative(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} hafta oldin`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} oy oldin`;
  return `${Math.floor(diff / 31536000)} yil oldin`;
}

export function truncate(str: string, n = 100): string {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function getErrorMessage(e: any): string {
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Xatolik yuz berdi';
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUsername(u: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(u);
}

export function levelFromXP(xp: number): { level: string; nextXP: number; progress: number } {
  if (xp < 100) return { level: 'Bronze', nextXP: 100, progress: xp };
  if (xp < 500) return { level: 'Silver', nextXP: 500, progress: ((xp - 100) / 400) * 100 };
  if (xp < 2000) return { level: 'Gold', nextXP: 2000, progress: ((xp - 500) / 1500) * 100 };
  if (xp < 5000) return { level: 'Platinum', nextXP: 5000, progress: ((xp - 2000) / 3000) * 100 };
  if (xp < 10000) return { level: 'Diamond', nextXP: 10000, progress: ((xp - 5000) / 5000) * 100 };
  return { level: 'Legend', nextXP: 100000, progress: 100 };
}
