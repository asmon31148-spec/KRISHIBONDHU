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
      className={`relative rounded-2xl p-0.5 bg-gradient-to-br from-emerald-500 via-emerald-700 to-emerald-950 shadow-md flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform ${className}`}
    >
      {/* Subtle Golden Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-transparent to-white/25 pointer-events-none" />

      {/* Embedded Commercial SVG Mark */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5"
      >
        {/* Shield / Seed Background contour */}
        <path
          d="M24 4C14 4 6 11 6 22C6 33.5 15.5 41.5 24 44C32.5 41.5 42 33.5 42 22C42 11 34 4 24 4Z"
          fill="url(#shieldGrad)"
        />

        {/* Golden Wheat Stalk (Left Branch) */}
        <path
          d="M17 28C15 25 15.5 21 17 18C18.5 21 19 25 17 28Z"
          fill="#F6AD55"
        />
        <path
          d="M19 22C17.5 19.5 18 16 19.5 13.5C21 16 21.5 19.5 19 22Z"
          fill="#ED8936"
        />
        <path
          d="M22 17C21 14.5 21.5 11 23 9C24 11 24.5 14.5 22 17Z"
          fill="#ECC94B"
        />

        {/* Vibrant Green Leaf / Sprout (Right Branch) */}
        <path
          d="M24 37C24 37 25 29 31 25C37 21 34 13 34 13C34 13 28 14 26 21C24.5 26.5 24 37 24 37Z"
          fill="#68D391"
        />
        <path
          d="M24 30C26 27 30 25.5 32 23C29 25 26 27 24 30Z"
          fill="#38A169"
        />

        {/* Center Stem */}
        <path
          d="M24 40V12"
          stroke="#FAF5FF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Small Sun Ray / Sparkle at Top */}
        <circle cx="24" cy="7.5" r="2" fill="#F6E05E" />

        <defs>
          <linearGradient id="shieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#064E3B" />
            <stop offset="1" stopColor="#022C22" />
          </linearGradient>
        </defs>
      </svg>
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
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
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
