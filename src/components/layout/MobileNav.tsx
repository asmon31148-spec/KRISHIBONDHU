'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  ScanLine,
  Bot,
  Warehouse,
  User,
  Menu,
  X,
  Sprout,
  CloudSun,
  Newspaper,
  LineChart,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isGuest, signOut } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { label: t('nav.home'), href: isGuest ? '/' : '/dashboard', icon: Home },
    { label: t('nav.scan'), href: '/scan', icon: ScanLine },
    { label: t('nav.assistant'), href: '/assistant', icon: Bot },
    { label: t('nav.myFarm'), href: '/farms', icon: Warehouse },
    { label: t('nav.profile'), href: '/profile', icon: User },
  ];

  const moreItems = [
    { label: t('nav.crops'), href: '/crops', icon: Sprout },
    { label: t('nav.weather'), href: '/weather', icon: CloudSun },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: t('nav.analytics'), href: '/analytics', icon: LineChart },
    { label: t('nav.systemStatus'), href: '/setup', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Drawer for 'More' */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-xs flex flex-col justify-end"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-cream-50 rounded-t-3xl border-t border-cream-200 p-5 shadow-2xl z-10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <span className="text-base font-bold text-brand-dark">
                {t('nav.more')}
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-cream-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-cream-200 hover:border-brand-leaf/40 text-brand-dark transition-all text-center"
                  >
                    <Icon className="w-6 h-6 text-brand-leaf mb-2" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {!isGuest && (
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/98 backdrop-blur-md border-t border-cream-200/90 px-1 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around"
      >
        {mainTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-0.5 px-1 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-brand-forest font-bold'
                  : 'text-brand-dark/60 hover:text-brand-dark'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-brand-mint/40 text-brand-forest' : 'text-brand-dark/70'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="truncate max-w-[58px] leading-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* More trigger */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center justify-center min-w-[52px] min-h-[44px] py-0.5 px-1 rounded-xl text-[10px] font-semibold text-brand-dark/60 hover:text-brand-dark"
        >
          <div className="p-1 rounded-lg text-brand-dark/70">
            <Menu className="w-5 h-5" />
          </div>
          <span className="leading-tight">{t('nav.more')}</span>
        </button>
      </nav>
    </>
  );
}
