'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let ytPromise: Promise<any> | null = null;

function loadYouTubeAPI(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytPromise) return ytPromise;

  ytPromise = new Promise((resolve) => {
    // Only load when browser is idle to prevent reload lag
    const inject = () => {
      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') prevReady();
        resolve(window.YT);
      };
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(inject, { timeout: 2000 });
    } else {
      setTimeout(inject, 200);
    }
  });

  return ytPromise;
}

interface HeroVideoBackgroundProps {
  videoId?: string;
  startSeconds?: number;
  endSeconds?: number;
}

export default function HeroVideoBackground({
  videoId = '0DfZHHDKqI4',
  startSeconds = 10,
  endSeconds = 45,
}: HeroVideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const loopTimerRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;

    loadYouTubeAPI().then((YT) => {
      if (!YT || !isMountedRef.current || !containerRef.current) return;

      try {
        playerRef.current = new YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            start: startSeconds,
            loop: 1,
          },
          events: {
            onReady: (e: any) => {
              if (!isMountedRef.current) return;
              const p = e.target;
              try {
                p.mute();
                p.seekTo(startSeconds, true);
                p.playVideo();
                setIsReady(true);

                // Set timed loop without tight 200ms polling
                const loopDurationMs = Math.max(5000, (endSeconds - startSeconds) * 1000);
                const scheduleLoop = () => {
                  if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
                  loopTimerRef.current = setTimeout(() => {
                    if (!isMountedRef.current || !p) return;
                    try {
                      p.seekTo(startSeconds, true);
                      scheduleLoop();
                    } catch {}
                  }, loopDurationMs);
                };
                scheduleLoop();
              } catch {}
            },
            onStateChange: (e: any) => {
              if (!isMountedRef.current) return;
              if (e.data === window.YT?.PlayerState?.ENDED) {
                try {
                  e.target.seekTo(startSeconds, true);
                  e.target.playVideo();
                } catch {}
              }
            },
          },
        });
      } catch (err) {
        console.warn('Hero video init error, falling back to photographic background', err);
      }
    });

    return () => {
      isMountedRef.current = false;
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [videoId, startSeconds, endSeconds]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* High performance photographic authentic farm backdrop (instant render, zero lag) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 scale-102"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=75')`,
          opacity: isReady ? 0.35 : 0.85,
        }}
      />

      {/* Video Container (scaled to cover 16:9 aspect ratio across any desktop/mobile screen) */}
      <div
        className="absolute top-1/2 left-1/2 transition-opacity duration-700"
        style={{
          width: '177.78vh',
          height: '56.25vw',
          minWidth: '100%',
          minHeight: '100%',
          transform: 'translate(-50%, -50%)',
          opacity: isReady ? 1 : 0,
        }}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Soft, authentic transparent overlay: NOT blurred to death, crisp & lively farming vibe */}
      <div className="absolute inset-0 bg-[#0c180e]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c180e]/85 via-transparent to-[#0c180e]/40" />
    </div>
  );
}
