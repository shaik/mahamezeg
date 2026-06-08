const CACHE_NAME = 'mahamezeg-v1.04';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './weatherService.js',
  './phraseMatrix.js',
  './locationConfig.js',
  './demoMode.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (new URL(event.request.url).hostname === 'api.open-meteo.com') return;

  // Network-first: always fetch fresh, update cache, fall back to cache if offline.
  // Cache-first would serve stale files after deployments.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
