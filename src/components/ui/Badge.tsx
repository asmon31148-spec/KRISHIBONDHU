import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'red' | 'slate' | 'forest' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'forest',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    forest: 'bg-brand-forest/10 dark:bg-emerald-500/20 text-brand-forest dark:text-emerald-300 border-brand-forest/20 dark:border-emerald-500/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    red: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30',
    slate: 'bg-cream-100 dark:bg-white/10 text-brand-dark/80 dark:text-white/80 border-cream-300 dark:border-white/20',
    outline: 'border border-brand-leaf/30 dark:border-white/20 text-brand-leaf dark:text-emerald-400 bg-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs sm:text-sm px-2.5 py-1 rounded-lg font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 border transition-colors',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
