import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'amber' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-brand-forest hover:bg-brand-leaf text-white shadow-sm border border-brand-forest/20',
      secondary:
        'bg-cream-100 hover:bg-cream-200 text-brand-dark border border-cream-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700',
      outline:
        'border-2 border-brand-leaf/40 text-brand-forest hover:bg-brand-leaf/10 dark:text-emerald-400 dark:border-emerald-500/40 dark:hover:bg-emerald-950/40 bg-transparent',
      amber:
        'bg-brand-harvest hover:bg-brand-harvestDark text-white shadow-sm',
      danger:
        'bg-red-700 hover:bg-red-800 text-white shadow-sm',
      ghost:
        'hover:bg-cream-200/60 dark:hover:bg-slate-800/80 text-brand-dark/80 dark:text-slate-200 hover:text-brand-dark dark:hover:text-white bg-transparent',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
      md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2', // Meets 44px mobile touch target
      lg: 'text-base px-6 py-3.5 min-h-[50px] gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
