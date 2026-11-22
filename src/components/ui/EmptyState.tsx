import React from 'react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50/50',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center text-brand-leaf mb-4 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-brand-dark mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-brand-dark/70 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
