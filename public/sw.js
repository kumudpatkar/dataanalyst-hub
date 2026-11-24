
const CACHE_NAME = 'dataanalyst-hub-v3';

const PDF_URLS = [
  '/handbooks/excel-handbook.pdf',
  '/handbooks/sql-handbook.pdf',
  '/handbooks/python-handbook.pdf',
  '/handbooks/power-bi-handbook.pdf',
  '/handbooks/data-analyst-handbook.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll([
        '/',
        '/icon.svg',
        '/manifest.webmanifest'
      ]);

      // Pre-cache all five PDF handbooks.
      // A single PDF failure will not stop installation.
      await Promise.allSettled(
        PDF_URLS.map((url) => cache.add(url))
      );
    })()
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Handle PDF handbooks separately.
  if (PDF_URLS.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        if (cached) {
          return cached;
        }

        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          return new Response(
            'This handbook is not available offline yet. Please connect to the internet once to download it.',
            {
              status: 503,
              headers: {
                'Content-Type': 'text/plain; charset=utf-8'
              }
            }
          );
        }
      })()
    );

    return;
  }

  // Cache website pages for offline use.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();

            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) =>
                cache.put('/', copy)
              )
            );
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match(request) ||
            await caches.match('/')
          );
        })
    );

    return;
  }

  // Cache Next.js static files.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();

            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) =>
                cache.put(request, copy)
              )
            );
          }

          return response;
        });
      })
    );
  }
});
