const CACHE_NAME = 'mahamezeg-v1';
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
  // Never cache weather API responses — stale weather must not be shown as current
  if (new URL(event.request.url).hostname === 'api.open-meteo.com') return;

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
