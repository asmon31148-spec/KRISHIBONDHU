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
  Scale,
  LayoutDashboard,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isGuest, signOut, user, profile } = useAuth();

  const navItems = [
    { label: t('nav.home'), href: '/', icon: Home },
    ...(!isGuest ? [{ label: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard }] : []),
    { label: t('nav.scan'), href: '/scan', icon: ScanLine },
    { label: t('nav.assistant'), href: '/assistant', icon: Bot },
    { label: t('nav.yield'), href: '/yield', icon: Scale },
    { label: t('nav.mandi'), href: '/mandi', icon: TrendingUp },
    { label: t('nav.fertilizer'), href: '/fertilizer', icon: FlaskConical },
    { label: t('nav.myFarm'), href: '/farms', icon: Warehouse },
    { label: t('nav.weather'), href: '/weather', icon: CloudSun },
    { label: t('nav.news'), href: '/news', icon: Newspaper },
    { label: t('nav.schemes'), href: '/schemes', icon: FileText },
    { label: t('nav.analytics'), href: '/analytics', icon: LineChart },
    { label: t('nav.sources'), href: '/sources', icon: BookOpen },
    { label: t('nav.profile'), href: '/profile', icon: User },
  ];

  const userInitial = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const userDisplayName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#143224]/10 bg-[#F9F7F2]/80 h-[calc(100dvh-57px)] sticky top-[57px] p-3.5 shrink-0 print:hidden justify-between">
      {/* Scrollable Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 -mr-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#143224] text-white shadow-[0_2px_8px_rgba(20,50,36,0.18)]'
                  : 'text-[#10241A]/80 hover:text-[#10241A] hover:bg-[#EAF2EC]/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9822B]' : 'text-[#1E4733]'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area: Guest Banner OR Dignified Integrated User Profile Card */}
      <div className="pt-3 mt-2 border-t border-[#143224]/10 shrink-0">
        {isGuest ? (
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('guest.bannerTitle')}</span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed mb-2">
              {t('guest.bannerDesc')}
            </p>
            <Link
              href="/auth/signup"
              className="block text-center text-xs font-bold px-3 py-1.5 rounded-lg bg-[#D9822B] text-white hover:bg-[#BF6D1C] transition-colors shadow-2xs"
            >
              {t('guest.createAccountBtn')}
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#EAF2EC]/70 border border-[#143224]/10 hover:bg-[#EAF2EC] transition-colors">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
              title="View profile & settings"
            >
              <div className="w-8 h-8 rounded-full bg-[#143224] text-[#D9822B] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-[#143224] truncate group-hover:text-[#D9822B] transition-colors">
                  {userDisplayName}
                </p>
                <span className="text-[10px] text-[#5E7367] block truncate">
                  {user?.email || 'Active Account'}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              title={t('nav.logout') || 'Sign Out'}
              className="p-1.5 rounded-lg text-[#143224]/70 hover:text-red-700 hover:bg-red-50 transition-colors ml-1 shrink-0 cursor-pointer"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
