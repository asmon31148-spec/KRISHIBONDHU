'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogoMark } from './BrandLogo';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Only show splash once per session on cold app launch
    const hasSeenSplash = sessionStorage.getItem('krishibondhu_splash_seen');
    if (hasSeenSplash) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem('krishibondhu_splash_seen', 'true');
      return;
    }

    setIsVisible(true);

    // Keep splash around 1.5s, then start smooth 300ms fade-out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('krishibondhu_splash_seen', 'true');
      }, 350);
      return () => clearTimeout(dismissTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('krishibondhu_splash_seen', 'true');
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#143224] via-[#0F261B] to-[#0A1A12] text-white select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ minHeight: '100dvh' }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center space-y-4 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Animated Sprout & Shield Logo Mark */}
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <BrandLogoMark className="w-16 h-16 sm:w-20 sm:h-20 shadow-2xl relative z-10" />
        </div>

        {/* Brand Wordmark & Tagline */}
        <div className="space-y-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-0.5">
            <span>KRISHIBONDHU</span>
            <span className="text-[#D9822B] text-3xl leading-none">·</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 tracking-wider uppercase">
            Bengal Agritech · Agronomy AI
          </p>
        </div>

        {/* Soft Loading Indicator */}
        <div className="pt-6 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
