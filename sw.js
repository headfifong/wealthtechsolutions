const CACHE_NAME = 'dev-static-v2';
const DYNAMIC_CACHE_NAME = 'dev-dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Cache core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline page');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Handle requests with strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Navigation Requests (HTML): Network First, fall back to cache
  // This ensures users get the latest version when online, but can load the app offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                // Fallback to index.html for SPA routing
                return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts): Cache First, fall back to Network
  // We use Dynamic Caching to cache assets as they are requested.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // Clone the response
        const responseToCache = networkResponse.clone();

        // Open dynamic cache and store the new resource
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
         // Network failed and not in cache.
         // Silently fail for non-critical assets
      });
    })
  );
});