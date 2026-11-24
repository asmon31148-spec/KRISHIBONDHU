'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { CloudSun, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { language } = useTranslation();
  const { profile, isGuest } = useAuth();

  const weatherBadgeText = {
    bn: '২৪°সে নদীয়া · স্প্রে নিরাপদ',
    hi: '24°C नादिया · सुरक्षित छिड़काव',
    en: '24°C Nadia · Spray Safe',
  }[language || 'en'];

  return (
    <header className="sticky top-0 z-40 w-full h-[57px] bg-[#F9F7F2]/95 backdrop-blur-md border-b border-[#143224]/10 px-4 sm:px-6 lg:px-8 flex items-center transition-all shadow-xs print:hidden shrink-0">
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo & Subtle Weather Indicator */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <BrandLogo size="md" />

          {/* Compact Weather Pill (Only on wide screens to preserve breathing space) */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2EC] border border-[#143224]/10 text-[#143224] text-xs font-semibold select-none">
            <CloudSun className="w-3.5 h-3.5 text-[#D9822B] shrink-0" />
            <span className="truncate">{weatherBadgeText}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0 ml-0.5" />
          </div>
        </div>

        {/* Right Tools: Language Switcher, User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <LanguageSelector variant="header" />

          {/* User Profile Avatar or Guest Sign In */}
          {isGuest ? (
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-bold text-[#143224] hover:text-white px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-[#143224] border border-[#143224]/15 transition-all shadow-2xs whitespace-nowrap"
            >
              {language === 'bn' ? 'লগইন' : language === 'hi' ? 'लॉगिन' : 'Sign In'}
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center p-1 rounded-xl hover:bg-white/80 transition-colors text-[#143224] border border-transparent hover:border-[#143224]/10"
              aria-label="User profile"
              title={profile?.full_name || 'My Profile'}
            >
              <div className="w-8 h-8 rounded-full bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ring-2 ring-white">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
