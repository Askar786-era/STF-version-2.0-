const CACHE_NAME = 'stf-cache-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/STF.html',
  '/STF.css',
  '/STF login.html',
  '/STF login.css',
  '/Doner register page.html',
  '/Doner register page.css',
  '/Request Blood.html',
  '/STF3.css',
  '/app.js',
  '/logo.jpg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST strategy: always try the network first, fall back to cache
// This ensures users always see the latest content when online
self.addEventListener('fetch', (event) => {
  // Let the browser handle non-GET requests or API calls directly
  if (event.request.method !== 'GET' || event.request.url.includes('/api/') || event.request.url.includes('/socket.io/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone the response and update the cache with fresh content
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache (offline fallback)
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('You are offline. Please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
