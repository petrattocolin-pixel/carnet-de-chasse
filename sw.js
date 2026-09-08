const CACHE_NAME = 'carnet-de-chasse-v3';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Ne gère que les requêtes GET de même origine (laisse passer les tuiles de carte, Firestore, etc.)
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then((res) => {
      const resCopy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, resCopy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req))
  );
});

