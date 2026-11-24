'use client';

import React, { useRef, useEffect } from 'react';

interface HeroVideoBackgroundProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function HeroVideoBackground({
  videoSrc = '/videos/hero-farm-loop.mp4',
  posterSrc = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=75',
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure muted is set both as property and attribute for universal autoplay across browsers & iOS/Android
    video.defaultMuted = true;
    video.muted = true;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts autoplay without interaction, poster remains cleanly visible
        });
      }
    };

    attemptPlay();

    // When returning to tab or window focus, resume playback seamlessly without stutter
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 
        Native HTML5 Video with Built-in Poster Fallback:
        Preloads automatically, loops continuously, and never flickers between image and video.
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transform-gpu"
      />

      {/* Gentle, authentic transparent overlay: clean agricultural vibe with high text contrast */}
      <div className="absolute inset-0 bg-[#0c180e]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c180e]/85 via-transparent to-[#0c180e]/40" />

      {/* Seamless Soft Fade Dissolve into Page Background (#F9F7F2) */}
      <div className="absolute inset-x-0 bottom-0 h-36 sm:h-52 lg:h-72 bg-gradient-to-b from-transparent via-[#F9F7F2]/60 to-[#F9F7F2] pointer-events-none" />
    </div>
  );
}
