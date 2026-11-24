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

  useEffect(() => {
    // Check if user has reduced-motion enabled
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const video = videoRef.current;
    if (!video || mediaQuery.matches) return;

    // Mobile Autoplay Guarantee: Muted must be set before play()
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts video autoplay (e.g. data saver mode), poster stays visible
        });
      }
    };

    playVideo();

    // Resume video playback when returning from background or tab switch
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 
        Native HTML5 Mobile Video with Low Data Fallback:
        Uses muted + playsinline + autoplay + preload="auto" for 100% Android/iOS compatibility.
        Focal object-position: center 30% ensures farmer and crop are framed properly on mobile.
      */}
      {!isReducedMotion && !hasError && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] transform-gpu scale-[1.02]"
        />
      )}

      {/* Static High-Resolution Fallback for Reduced Motion or Video Failure */}
      {(isReducedMotion || hasError) && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-[center_30%]"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
      )}

      {/* High-Legibility Dark Scrim: Preserves white text contrast under sunlight */}
      <div className="absolute inset-0 bg-[#061209]/45 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#061209]/90 via-black/20 to-[#061209]/50" />

      {/* Adaptive Soft Dissolve into Active Page Background (Light or Dark Mode) */}
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 lg:h-72 bg-gradient-to-b from-transparent via-[#F9F7F2]/60 to-[#F9F7F2] dark:via-[#0B1711]/60 dark:to-[#0B1711] pointer-events-none transition-colors duration-200" />
    </div>
  );
}
