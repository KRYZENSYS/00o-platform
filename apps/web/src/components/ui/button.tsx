'use client';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-border bg-transparent hover:bg-surface-2',
        secondary: 'bg-surface-2 text-text hover:bg-surface-3',
        ghost: 'hover:bg-surface-2',
        link: 'text-brand-500 underline-offset-4 hover:underline',
        glass: 'glass text-text hover:bg-white/20',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-base',
        xl: 'h-14 rounded-2xl px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={loading || props.disabled} {...props}>
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };
