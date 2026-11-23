// KRISHIBONDHU - Reliable Progressive Web App Service Worker
// Cache-first only for static visual assets; Network-first for all Next.js pages and chunks to prevent stale chunk errors

const CACHE_NAME = 'krishibondhu-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge all old caches immediately to prevent reload delays and chunk mismatch errors
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls, Next.js chunk files, or dynamic server routes
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('chrome-extension')
  ) {
    return;
  }

  // Network-first for navigation pages (ensures instant reload with latest deployment)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request) || caches.match('/');
      })
    );
    return;
  }

  // Cache-first only for local static files (svg, png, json)
  if (url.origin === self.origin && (url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.json'))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
  }
});
