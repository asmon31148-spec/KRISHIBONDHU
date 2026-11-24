// KRISHIBONDHU Offline Field Mode Service Worker
// Uses Network-First for pages & live APIs so farmers always get fresh data online,
// and falls back to cached field tools (Fertilizer Calc, Weather, Mandi, Schemes) when signal drops to 0 bars.
const CACHE_NAME = 'krishibondhu-field-v1';

const PRECACHE_URLS = [
  '/',
  '/fertilizer',
  '/weather',
  '/mandi',
  '/schemes',
  '/scan',
  '/brand-logo.png',
  '/icon-192.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache auth callbacks or AI mutation endpoints
  if (
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/api/scan/') ||
    url.pathname.startsWith('/api/soil/') ||
    url.pathname.startsWith('/api/assistant/')
  ) {
    return;
  }

  // Cache-first for hashed Next.js static build assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // Network-first with offline fallback for pages and read-only APIs (/api/weather, /api/mandi, etc.)
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
