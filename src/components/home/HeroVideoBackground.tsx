'use client';

import React, { useRef, useState, useEffect } from 'react';

interface HeroVideoBackgroundProps {
  videoSrc?: string;
  posterSrc?: string;
}

export default function HeroVideoBackground({
  videoSrc = '/videos/hero-farm-loop.mp4',
  posterSrc = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=75',
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force autoplay attempt
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser blocks autoplay
          setIsPlaying(false);
        });
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* High-performance photographic backdrop (instant render before video loads) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 scale-102"
        style={{
          backgroundImage: `url('${posterSrc}')`,
          opacity: isPlaying ? 0.25 : 0.85,
        }}
      />

      {/* Seamless Native 1080p Looping Video with 9 Stitched Agricultural Scenes */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onPlaying={() => setIsPlaying(true)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          opacity: isPlaying ? 0.95 : 0,
        }}
      />

      {/* Gentle, authentic transparent overlay: clean agricultural vibe with high text contrast */}
      <div className="absolute inset-0 bg-[#0c180e]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c180e]/85 via-transparent to-[#0c180e]/40" />
    </div>
  );
}
