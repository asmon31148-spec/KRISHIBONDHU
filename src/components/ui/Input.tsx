import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      leftIcon,
      isPassword = false,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-brand-dark/90 tracking-wide"
          >
            {label}
            {props.required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-dark/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={twMerge(
              clsx(
                'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm sm:text-base text-brand-dark placeholder:text-brand-dark/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald min-h-[44px]',
                leftIcon && 'pl-10',
                isPassword && 'pr-11',
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-cream-300 hover:border-brand-leaf/40',
                disabled && 'bg-cream-100 cursor-not-allowed opacity-60',
                className
              )
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-dark/50 hover:text-brand-dark transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-brand-dark/60">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
