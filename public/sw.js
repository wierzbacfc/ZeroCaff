// ZeroCaff Service Worker
const CACHE_NAME = 'zerocaff-cache-v1.2.0';

// Calculate base path from location of sw.js
const getBasePath = () => {
  const path = self.location.pathname;
  return path.substring(0, path.lastIndexOf('/'));
};

const basePath = getBasePath();
const withBase = (path) => `${basePath}${path.startsWith('/') ? path : `/${path}`}`;

const STATIC_ASSETS = [
  withBase('/'),
  withBase('/manifest.json'),
  withBase('/coffee_bean_logo.jpg'),
  withBase('/icon-192.jpg'),
  withBase('/icon-512.jpg'),
  withBase('/icon-maskable.jpg'),
  withBase('/version.json')
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache prefill partial failure:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or chrome-extension URLs
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // For version check, always fetch from network directly
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first with cache fallback strategy for pages and assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(withBase('/'));
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
