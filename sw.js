// Service Worker para SUMAQ Agenda - Actualización Inmediata y Sin Bloqueos de Caché
const CACHE_NAME = 'sumaq-v3-' + Date.now();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NO interceptar llamadas a Supabase ni endpoints de backend
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1')) {
    return;
  }

  // Network-first siempre para HTML, navegación y assets
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        // Solo cachear si la respuesta es válida 200
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback a caché solo si está completamente offline
        return caches.match(event.request);
      })
  );
});
