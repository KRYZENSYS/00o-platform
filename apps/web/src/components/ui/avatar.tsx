'use client';
import * as React from 'react';
import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ src, name = '?', size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white', sizes[size], className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span>{initials(name)}</span>}
    </div>
  );
}
