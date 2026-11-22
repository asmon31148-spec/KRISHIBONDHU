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
    forest: 'bg-brand-forest/10 text-brand-forest border-brand-forest/20',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    slate: 'bg-cream-100 text-brand-dark/80 border-cream-300',
    outline: 'border border-brand-leaf/30 text-brand-leaf bg-transparent',
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
