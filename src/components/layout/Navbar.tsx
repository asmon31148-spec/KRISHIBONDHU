'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ScanLine, CloudSun, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { language } = useTranslation();
  const { user, profile, isGuest } = useAuth();

  const weatherBadgeText = {
    bn: '২৪°সে নদীয়া · স্প্রে উইন্ডো খোলা (০৬:০০ - ০৯:০০)',
    hi: '24°C नादिया · छिड़काव अनुकूल समय (06:00 - 09:00)',
    en: '24°C Nadia · Safe Spray Window (06:00 - 09:00)',
  }[language || 'en'];

  const quickActionText = {
    bn: 'ডাক্তার পরামর্শ / স্ক্যান',
    hi: 'फसल जांच / डॉक्टर',
    en: 'Consult Doctor / Scan',
  }[language || 'en'];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#143224]/10 px-3 sm:px-6 lg:px-8 py-2.5 transition-all shadow-[0_2px_12px_rgba(20,50,36,0.03)] print:hidden">
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-4 shrink-0">
          <BrandLogo size="md" />

          {/* Live Micro-Climate / Spray Badge for Field Utility */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF2EC] border border-[#143224]/15 text-[#143224] text-xs font-semibold select-none">
            <CloudSun className="w-4 h-4 text-[#D9822B] shrink-0" />
            <span className="truncate max-w-[320px]">{weatherBadgeText}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Right Tools: Language Switcher, Consult CTA, Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSelector variant="header" />

          {/* Command Bar Quick Action: Consult Doctor / Scan Crop */}
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#143224] hover:bg-[#1E4733] text-white text-xs sm:text-sm font-bold shadow-[0_2px_8px_rgba(20,50,36,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all select-none border border-[#143224]"
          >
            <ScanLine className="w-4 h-4 text-[#D9822B]" />
            <span className="whitespace-nowrap">{quickActionText}</span>
          </Link>

          {/* User Profile or Login Link */}
          {isGuest ? (
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-bold text-[#143224] hover:text-[#1E4733] px-3 py-2 rounded-xl bg-white/80 hover:bg-white border border-[#143224]/10 transition-colors whitespace-nowrap"
            >
              {language === 'bn' ? 'লগইন' : language === 'hi' ? 'लॉगिन' : 'Sign In'}
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/80 transition-colors text-[#143224] border border-transparent hover:border-[#143224]/10"
              aria-label="User profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#EAF2EC] border border-[#143224]/20 flex items-center justify-center text-[#143224] font-bold text-xs shrink-0">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold max-w-[120px] truncate text-[#143224]">
                {profile?.full_name || user?.email?.split('@')[0]}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
