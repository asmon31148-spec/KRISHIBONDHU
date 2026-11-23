'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Bell, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Navbar() {
  const { t } = useTranslation();
  const { user, profile, isGuest } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-cream-200/90 px-3 sm:px-6 lg:px-8 py-2.5 transition-all shadow-xs">
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Commercial Brand Logo */}
        <BrandLogo size="md" />

        {/* Right tools: Language selector, Status, Guest/User, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageSelector variant="header" />

          {/* Guest Mode Indicator or Saved State */}
          {isGuest ? (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="amber" size="sm">
                {t('nav.guestMode')}
              </Badge>
              <Link
                href="/auth/signup"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-forest text-white hover:bg-brand-leaf transition-colors"
              >
                {t('nav.saveAccount')}
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard/notifications"
              className="relative p-1.5 sm:p-2 rounded-xl text-brand-dark/70 hover:text-brand-dark hover:bg-cream-200 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          )}

          {/* User Profile or Login Link */}
          {isGuest ? (
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-bold text-brand-forest hover:text-brand-leaf px-2.5 py-1.5 rounded-lg bg-cream-100/80 hover:bg-cream-200 transition-colors whitespace-nowrap"
            >
              {t('nav.login')}
            </Link>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-cream-200 transition-colors text-brand-dark"
              aria-label="User profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-mint/40 border border-brand-leaf/30 flex items-center justify-center text-brand-forest font-bold text-xs shrink-0">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold max-w-[120px] truncate">
                {profile?.full_name || user?.email?.split('@')[0]}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
