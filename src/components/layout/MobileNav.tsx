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
  CloudSun,
  Newspaper,
  LineChart,
  BookOpen,
  FileText,
  LogOut,
  TrendingUp,
  FlaskConical,
  Scale,
  History,
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
  ];

  const moreItems = [
    { label: t('nav.scanHistory'), href: '/scans/history', icon: History },
    { label: t('nav.yield'), href: '/yield', icon: Scale },
    { label: t('nav.mandi'), href: '/mandi', icon: TrendingUp },
    { label: t('nav.fertilizer'), href: '/fertilizer', icon: FlaskConical },
    { label: t('nav.profile'), href: '/profile', icon: User },
    { label: t('nav.weather'), href: '/weather', icon: CloudSun },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: t('nav.schemes'), href: '/schemes', icon: FileText },
    { label: t('nav.analytics'), href: '/analytics', icon: LineChart },
    { label: t('nav.sources'), href: '/sources', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Drawer for 'More' */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-[60] bg-brand-dark/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-cream-50 rounded-t-3xl border-t border-cream-200 p-4 pb-safe shadow-2xl z-10 max-h-[82vh] overflow-y-auto">
            {/* Visual drag handle for tactile mobile feedback */}
            <div className="w-12 h-1.5 bg-cream-300 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <span className="text-base font-bold text-brand-dark">
                {t('nav.more')}
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-cream-100 text-brand-dark/70 hover:text-brand-dark transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ergonomic 2-column horizontal cards that do not bloat vertical space */}
            <div className="grid grid-cols-2 gap-2.5 py-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-cream-200 shadow-2xs hover:border-brand-leaf/40 active:bg-cream-100 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-cream-100 text-brand-leaf shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-brand-dark text-left leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Logout button with clearance above the bottom edge */}
            {!isGuest && (
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  signOut();
                }}
                className="w-full mt-2 mb-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100 active:scale-[0.99] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar with 85-90% Frosted Liquid Glass & Safe-Area Inset */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream-50/92 backdrop-blur-md border-t border-brand-forest/15 px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] flex items-center justify-around"
      >
        {mainTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[62px] min-h-[48px] py-1 px-1 rounded-xl text-[10px] transition-all ${
                isActive
                  ? 'text-brand-forest font-extrabold'
                  : 'text-brand-dark/75 hover:text-brand-forest font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-brand-forest text-white shadow-xs' : 'text-brand-dark/70'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="truncate max-w-[64px] leading-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}

        {/* More trigger */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center justify-center min-w-[62px] min-h-[48px] py-1 px-1 rounded-xl text-[10px] font-semibold text-brand-dark/75 hover:text-brand-forest"
        >
          <div className="p-1.5 rounded-xl text-brand-dark/70">
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="leading-tight mt-0.5">{t('nav.more')}</span>
        </button>
      </nav>
    </>
  );
}
