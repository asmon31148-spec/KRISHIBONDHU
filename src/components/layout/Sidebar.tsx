'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  ScanLine,
  Bot,
  Warehouse,
  CloudSun,
  Newspaper,
  LineChart,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  FileText,
  TrendingUp,
  FlaskConical,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isGuest, signOut } = useAuth();

  const navItems = [
    { label: t('nav.home'), href: isGuest ? '/' : '/dashboard', icon: Home },
    { label: t('nav.scan'), href: '/scan', icon: ScanLine },
    { label: t('nav.assistant'), href: '/assistant', icon: Bot },
    { label: 'Mandi Radar', href: '/mandi', icon: TrendingUp },
    { label: 'Fertilizer Calc', href: '/fertilizer', icon: FlaskConical },
    { label: t('nav.myFarm'), href: '/farms', icon: Warehouse },
    { label: t('nav.weather'), href: '/weather', icon: CloudSun },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: 'Schemes', href: '/schemes', icon: FileText },
    { label: t('nav.analytics'), href: '/analytics', icon: LineChart },
    { label: 'Sources', href: '/sources', icon: BookOpen },
    { label: t('nav.profile'), href: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-cream-200/90 bg-white/70 min-h-[calc(100vh-61px)] p-4 shrink-0">
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-forest text-white shadow-xs'
                  : 'text-brand-dark/75 hover:text-brand-dark hover:bg-cream-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-mint' : 'text-brand-leaf'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Guest Conversion Card in Sidebar */}
      {isGuest && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 mb-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('guest.bannerTitle')}</span>
          </div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed mb-2.5">
            {t('guest.bannerDesc')}
          </p>
          <Link
            href="/auth/signup"
            className="block text-center text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-harvest text-white hover:bg-brand-harvestDark transition-colors"
          >
            {t('guest.createAccountBtn')}
          </Link>
        </div>
      )}

      {/* Sign Out Button for Signed In Farmers */}
      {!isGuest && (
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>{t('nav.logout')}</span>
        </button>
      )}
    </aside>
  );
}
