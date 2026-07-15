'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">{leftIcon}</div>}
        <input
          type={type}
          className={cn(
            'w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm transition-all placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightIcon}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export { Input };
