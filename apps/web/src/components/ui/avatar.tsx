'use client';
import { HTMLAttributes } from 'react';
import { cn, initials } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-2xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-slate-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

export function Avatar({ name, src, size = 'md', status, className, ...props }: AvatarProps) {
  const i = initials(name || '?');
  return (
    <div className={cn('relative inline-flex shrink-0', className)} {...props}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className={cn('rounded-full object-cover ring-2 ring-white dark:ring-slate-900', sizes[size])} />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 font-semibold text-white ring-2 ring-white dark:ring-slate-900',
            sizes[size]
          )}
        >
          {i}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
