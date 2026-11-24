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
  const [enableVideo, setEnableVideo] = useState(false);

  useEffect(() => {
    // Only enable video playback on desktop / tablets with sufficient screen width (>768px)
    // and when user does NOT have prefers-reduced-motion set
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // Mobile phones preserve memory and battery with the high-res optimized photo backdrop
    if (prefersReducedMotion || isMobile) {
      return;
    }

    setEnableVideo(true);
  }, []);

  useEffect(() => {
    if (!enableVideo) return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [enableVideo]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* High-performance photographic backdrop (instant render, zero decoding lag on mobile) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform-gpu"
        style={{
          backgroundImage: `url('${posterSrc}')`,
          opacity: isPlaying ? 0.25 : 0.85,
        }}
      />

      {/* Seamless Optimized Looping Video (desktop/broadband with faststart) */}
      {enableVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onPlaying={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 transform-gpu"
          style={{
            opacity: isPlaying ? 0.95 : 0,
          }}
        />
      )}

      {/* Gentle, authentic transparent overlay: clean agricultural vibe with high text contrast */}
      <div className="absolute inset-0 bg-[#0c180e]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c180e]/85 via-transparent to-[#0c180e]/40" />
    </div>
  );
}
