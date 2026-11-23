'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Sprout, Bell, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Navbar() {
  const { t } = useTranslation();
  const { user, profile, isGuest } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-cream-50/90 backdrop-blur-md border-b border-brand-forest/15 px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-[1536px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-forest flex items-center justify-center text-white shadow-xs group-hover:bg-brand-leaf transition-colors shrink-0">
            <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-brand-mint" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-extrabold tracking-tight text-brand-forest group-hover:text-brand-leaf transition-colors leading-none">
              {t('brand.name')}
            </span>
            <span className="hidden xs:block text-[9px] sm:text-xs font-medium text-brand-dark/60 tracking-wider uppercase mt-0.5">
              Bengal Agritech
            </span>
          </div>
        </Link>

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
