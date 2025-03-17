const CACHE_NAME = 'real-estate-crm-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/properties',
  '/dashboard/projects',
  '/dashboard/leads',
  '/dashboard/tasks',
  '/dashboard/transactions',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install a service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Return the response as is for non GET requests or if status is not 200
            if (!event.request.url.startsWith('http') || 
                event.request.method !== 'GET' || 
                response.status !== 200) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. Since we want to consume this
            // once by the browser and once by the cache, we need to clone it
            const responseToCache = response.clone();

            // Don't cache API responses
            if (!event.request.url.includes('/api/')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          });
      })
      .catch(() => {
        // If main fails, try to serve the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return null;
      })
  );
});

// Update a service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
}); 