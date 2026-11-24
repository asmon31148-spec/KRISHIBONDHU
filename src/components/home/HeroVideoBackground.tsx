'use client';

import React, { useRef, useEffect, useState } from 'react';

interface HeroVideoBackgroundProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function HeroVideoBackground({
  videoSrc = '/videos/hero-farm-loop.mp4',
  posterSrc = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=75',
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Check if user has reduced-motion or data-saver enabled
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } };
    const isDataSaver = nav.connection?.saveData === true || nav.connection?.effectiveType === '2g';

    if (mediaQuery.matches || isDataSaver) {
      return;
    }

    // Defer video loading until main thread and critical resources have settled
    const startVideoLoad = () => {
      setShouldLoadVideo(true);
    };

    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(startVideoLoad, { timeout: 1200 });
      return () => (window as any).cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(startVideoLoad, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;

    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    playVideo();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [shouldLoadVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 
        Ultra-Fast Instant Poster:
        Rendered immediately so there is ZERO layout shift and instant FCP (< 200ms).
      */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-[center_30%]"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />

      {/* Deferred Background Video (Loads only after critical page bundle is hydrated) */}
      {!isReducedMotion && !hasError && shouldLoadVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] transform-gpu scale-[1.02] transition-opacity duration-700"
        />
      )}

      {/* High-Legibility Dark Scrim */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />

      {/* Adaptive Soft Dissolve into Active Page Background (Clean White or Modern Slate) */}
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 lg:h-72 bg-gradient-to-b from-transparent via-white/60 to-white dark:via-[#0B0F17]/60 dark:to-[#0B0F17] pointer-events-none transition-colors duration-200" />
    </div>
  );
}
