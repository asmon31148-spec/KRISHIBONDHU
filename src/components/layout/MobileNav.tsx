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
  FileText,
  LogOut,
  TrendingUp,
  FlaskConical,
  Scale,
  LayoutDashboard,
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isGuest, signOut } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { label: t('nav.home'), href: '/', icon: Home },
    ...(!isGuest ? [{ label: t('nav.dashboard') || 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] : []),
    { label: t('nav.scan'), href: '/scan', icon: ScanLine },
    { label: t('nav.assistant'), href: '/assistant', icon: Bot },
    ...(isGuest ? [{ label: t('nav.myFarm'), href: '/farms', icon: Warehouse }] : []),
  ];

  const moreItems = [
    ...(!isGuest ? [{ label: t('nav.myFarm'), href: '/farms', icon: Warehouse }] : []),
    { label: t('nav.yield'), href: '/yield', icon: Scale },
    { label: t('nav.mandi'), href: '/mandi', icon: TrendingUp },
    { label: t('nav.fertilizer'), href: '/fertilizer', icon: FlaskConical },
    { label: t('nav.profile'), href: '/profile', icon: User },
    { label: t('nav.weather'), href: '/weather', icon: CloudSun },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: t('nav.schemes'), href: '/schemes', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Drawer for 'More' */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-[60] bg-black/75 flex flex-col justify-end animate-in fade-in duration-150 print:hidden"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white dark:bg-[#0E1522] text-gray-900 dark:text-gray-100 rounded-t-3xl border-t border-gray-200 dark:border-slate-800 p-4 pb-safe shadow-2xl z-10 max-h-[82vh] overflow-y-auto">
            {/* Visual drag handle for tactile mobile feedback */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
              <span className="text-base font-bold text-brand-dark dark:text-white">
                {t('nav.more')}
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-cream-100 dark:bg-slate-800 text-brand-dark/70 dark:text-white/70 hover:text-brand-dark dark:hover:text-white transition-colors"
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
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#141C2B] border border-cream-200 dark:border-slate-800 shadow-2xs hover:border-brand-leaf/40 active:bg-cream-100 dark:active:bg-[#1B2537] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-cream-100 dark:bg-emerald-950/60 text-brand-leaf dark:text-emerald-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-brand-dark dark:text-white text-left leading-tight">
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
                className="w-full mt-2 mb-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-[0.99] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar with Edge-to-Edge Safe-Area Inset and Seamless Background */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0E1522] border-t border-gray-200 dark:border-slate-800 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around print:hidden transition-colors duration-200"
      >
        {mainTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-[62px] min-h-[46px] py-1 px-1 rounded-xl text-[10px] transition-all ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400'
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
          className="flex flex-col items-center justify-center min-w-[62px] min-h-[46px] py-1 px-1 rounded-xl text-[10px] font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <div className="p-1.5 rounded-xl text-gray-600 dark:text-gray-400">
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="leading-tight mt-0.5">{t('nav.more')}</span>
        </button>
      </nav>
    </>
  );
}
