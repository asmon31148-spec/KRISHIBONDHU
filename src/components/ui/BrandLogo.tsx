'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/context';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function BrandLogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform bg-white border border-[#143224]/15 ${className}`}
    >
      {/* User Brand Mark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-logo.png"
        alt="Krishibondhu"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function BrandLogo({ className = '', size = 'md', showSubtitle = true }: BrandLogoProps) {
  const { language } = useTranslation();

  const markSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12',
  };

  const titleSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none ${className}`}>
      <BrandLogoMark className={markSizes[size]} />

      <div className="flex flex-col text-left leading-none">
        <div className={`font-black tracking-tight ${titleSizes[size]} flex items-center`}>
          <span className="text-[#143224] transition-colors group-hover:text-[#1E4733]">
            KRISHI
          </span>
          <span className="text-[#2A5E44] transition-colors group-hover:text-[#1E4733]">
            BONDHU
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D9822B] ml-0.5 animate-pulse" />
        </div>

        {showSubtitle && (
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800/80 tracking-wide">
              {language === 'bn' ? 'কৃষিবন্ধু' : language === 'hi' ? 'कृषिबंधु' : 'Bengal Agritech'}
            </span>
            <span className="text-[9px] text-brand-dark/40 font-semibold">•</span>
            <span className="text-[8px] sm:text-[9px] font-semibold text-emerald-700/70 uppercase tracking-widest">
              {language === 'bn' ? 'ডিজিটাল প্ল্যাটফর্ম' : language === 'hi' ? 'डिजिटल मंच' : 'Digital Platform'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
