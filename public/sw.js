// Service Worker para SUMAQ Agenda (Network-first para evitar pantallas en negro por cache viejo)
const CACHE_NAME = 'sumaq-cache-v2';

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

  // NO interceptar peticiones de Supabase ni APIs
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1')) {
    return;
  }

  // Network-first para index.html y navegación
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Para assets JS y CSS, buscar en red primero y fallback a cache
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const respClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
  }
});
