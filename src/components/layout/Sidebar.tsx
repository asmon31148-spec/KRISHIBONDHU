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
  User,
  LogOut,
  Sparkles,
  FileText,
  TrendingUp,
  FlaskConical,
  Scale,
  LayoutDashboard,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const { isGuest, signOut, user, profile } = useAuth();

  const navigationHubs = [
    {
      title: language === 'bn' ? 'দৈনিক পরামর্শ ও সেবা' : language === 'hi' ? 'दैनिक परामर्श व सेवाएं' : 'Daily Advisory & Hub',
      items: [
        { label: t('nav.home') || 'Home', href: '/', icon: Home },
        ...(!isGuest ? [{ label: t('nav.dashboard') || 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] : []),
        { label: t('nav.scan'), href: '/scan', icon: ScanLine },
        { label: t('nav.assistant'), href: '/assistant', icon: Bot },
        { label: t('nav.weather'), href: '/weather', icon: CloudSun },
      ],
    },
    {
      title: language === 'bn' ? 'বাজার ও কৃষি উপকরণ' : language === 'hi' ? 'बाजार व कृषि सामग्री' : 'Market & Inputs',
      items: [
        { label: t('nav.mandi') || 'Mandi Radar', href: '/mandi', icon: TrendingUp },
        { label: t('nav.fertilizer') || 'Fertilizer Calc', href: '/fertilizer', icon: FlaskConical },
        { label: t('nav.yield') || 'Yield & Profit', href: '/yield', icon: Scale },
        { label: t('nav.news'), href: '/news', icon: Newspaper },
      ],
    },
    {
      title: language === 'bn' ? 'আমার খামার রেকর্ড' : language === 'hi' ? 'मेरे खेत के रिकॉर्ड' : 'My Farm Records',
      items: [
        { label: t('nav.myFarm'), href: '/farms', icon: Warehouse },
        { label: t('nav.schemes') || 'Schemes', href: '/schemes', icon: FileText },
        { label: t('nav.profile'), href: '/profile', icon: User },
      ],
    },
  ];

  const userInitial = profile?.full_name
    ? profile.full_name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const userDisplayName = profile?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#143224]/10 dark:border-white/10 bg-[#F9F7F2]/80 dark:bg-[#0B1711]/90 backdrop-blur-md h-[calc(100dvh-57px)] sticky top-[57px] p-3.5 shrink-0 print:hidden justify-between transition-colors duration-200">
      {/* Scrollable Grouped 3-Tier Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1 -mr-1 no-scrollbar">
        {navigationHubs.map((hub, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#143224]/50 dark:text-white/40 px-3 block">
              {hub.title}
            </span>
            <div className="space-y-0.5 pt-0.5">
              {hub.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#143224] dark:bg-emerald-500/20 text-white dark:text-[#34D399] dark:border dark:border-emerald-500/30 shadow-xs'
                        : 'text-[#10241A]/80 dark:text-[#EAF2EC]/75 hover:text-[#10241A] dark:hover:text-white hover:bg-[#EAF2EC]/70 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9822B] dark:text-[#34D399]' : 'text-[#1E4733] dark:text-emerald-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Area: Guest Banner OR Dignified Integrated User Profile Card */}
      <div className="pt-3 mt-2 border-t border-[#143224]/10 dark:border-white/10 shrink-0">
        {isGuest ? (
          <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t('guest.bannerTitle')}</span>
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-200/70 leading-relaxed mb-2">
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
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#EAF2EC]/70 dark:bg-[#13261D] border border-[#143224]/10 dark:border-white/10 hover:bg-[#EAF2EC] dark:hover:bg-[#1A3326] transition-colors">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
              title="View profile & settings"
            >
              <div className="w-8 h-8 rounded-full bg-[#143224] dark:bg-emerald-700 text-[#D9822B] dark:text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ring-1 ring-white/20">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-[#143224] dark:text-[#EAF2EC] truncate group-hover:text-[#D9822B] dark:group-hover:text-emerald-400 transition-colors">
                  {userDisplayName}
                </p>
                <span className="text-[10px] text-[#5E7367] dark:text-white/40 block truncate">
                  {user?.email || 'Active Account'}
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              title={t('nav.logout') || 'Sign Out'}
              className="p-1.5 rounded-lg text-[#143224]/70 dark:text-white/60 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1 shrink-0 cursor-pointer"
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
