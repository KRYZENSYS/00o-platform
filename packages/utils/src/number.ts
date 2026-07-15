export const formatNumber = (num: number, locale = 'uz-UZ'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCurrency = (num: number, currency = 'UZS', locale = 'uz-UZ'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatCompact = (num: number, locale = 'uz-UZ'): string => {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(num);
};

export const toCents = (sum: number): number => Math.round(sum * 100);
export const fromCents = (cents: number): number => cents / 100;

export const percentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};
