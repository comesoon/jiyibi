// v2: More robust fetch handling for SPA and opaque responses
const CACHE_NAME = 'jiyibi-cache-v3';
const URLS_TO_CACHE = [
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/js/api.js',
    '/js/auth.js',
    
    '/js/components.js',
    '/js/db.js',
    '/js/i18n.js',
    '/js/loader.js',
    '/js/store.js',
    '/js/sync.js',
    '/js/toast.js',
    '/js/ui.js',
    '/locales/en.json',
    '/locales/zh.json',
    '/icons/icon-192x192.svg',
    '/icons/icon-512x512.svg',
    
];

// Install: Caches app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching app shell');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

// Activate: Cleans up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch: Serves requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Use network-first for API calls
    if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
            .catch(error => {
                console.error('API fetch failed:', error);
                // Here you could return a cached "offline" response if you have one
            })
        );
        return;
    }

    // For all other GET requests, use a cache-first strategy,
    // but fall back to network and handle SPA navigation.
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }

                // For navigation requests, fall back to /index.html
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }

                // Otherwise, fetch from network
                return fetch(request).then(networkResponse => {
                    // For opaque responses (like from a CDN), we can't check the status,
                    // so we just cache them directly.
                    if (networkResponse.type === 'opaque') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                        return networkResponse;
                    }
                    
                    // For standard responses, check for validity before caching.
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });

                    return networkResponse;
                });
            })
        );
    }
});
