'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { CloudSun, User as UserIcon, Sun, Moon } from 'lucide-react';

export function Navbar() {
  const { language } = useTranslation();
  const { profile, isGuest } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const weatherBadgeText = {
    bn: '২৪°সে নদীয়া · স্প্রে নিরাপদ',
    hi: '24°C नादिया · सुरक्षित छिड़काव',
    en: '24°C Nadia · Spray Safe',
  }[language || 'en'];

  return (
    <header className="sticky top-0 z-40 w-full h-12 sm:h-14 bg-white dark:bg-[#0E1522] border-b border-gray-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center transition-colors duration-200 shadow-xs print:hidden shrink-0 pt-safe">
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Subtle Weather Indicator */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <BrandLogo size="md" />

          {/* Compact Weather Pill (Only on wide screens to preserve breathing space) */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#141C2B] border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-semibold select-none">
            <CloudSun className="w-3.5 h-3.5 text-[#D9822B] shrink-0" />
            <span className="truncate">{weatherBadgeText}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse shrink-0 ml-0.5" />
          </div>
        </div>

        {/* Right Tools: Theme Toggle, Language Switcher, User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Switch to daylight theme' : 'Switch to nocturnal field theme'}
            className="p-2 rounded-xl text-[#143224] dark:text-white hover:bg-black/5 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#143224]/10 dark:hover:border-slate-700"
            title={resolvedTheme === 'dark' ? 'Daylight Mode' : 'Nocturnal Mode'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FBBF24] transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#1E4733] transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          <LanguageSelector variant="header" />

          {/* User Profile Avatar or Guest Sign In */}
          {isGuest ? (
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-bold text-[#143224] dark:text-white hover:text-white dark:hover:text-white px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#141C2B] hover:bg-[#143224] dark:hover:bg-slate-700 border border-[#143224]/15 dark:border-slate-700 transition-all shadow-2xs whitespace-nowrap"
            >
              {language === 'bn' ? 'লগইন' : language === 'hi' ? 'लॉगिन' : 'Sign In'}
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center p-1 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 transition-colors text-[#143224] dark:text-white border border-transparent hover:border-[#143224]/10 dark:hover:border-slate-700"
              aria-label="User profile"
              title={profile?.full_name || 'My Profile'}
            >
              <div className="w-8 h-8 rounded-full bg-[#143224] dark:bg-emerald-700 text-[#D9822B] dark:text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ring-2 ring-white dark:ring-slate-700">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
