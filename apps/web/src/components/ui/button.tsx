import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const variants = {
    default: 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    gradient: 'bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 text-white shadow-lg hover:scale-105',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-9 w-9 p-0',
  };
  return <button ref={ref} className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className)} {...props} />;
});
Button.displayName = 'Button';
