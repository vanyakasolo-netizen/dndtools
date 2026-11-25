/* Service worker: офлайн-режим для D&D Toolkit.
   Стратегия: при установке кэшируется index.html и все файлы, которые он подключает;
   дальше — «кэш сначала, обновление в фоне». Чтобы выпустить обновление,
   достаточно пересобрать приложение: hash в именах файлов изменится сам. */
const CACHE = 'dnd-toolkit-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(CORE);
      try {
        const res = await fetch('./index.html', { cache: 'no-cache' });
        const html = await res.text();
        const urls = new Set();
        for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
          const u = new URL(m[1], self.registration.scope);
          if (u.origin === self.location.origin) urls.add(u.href);
        }
        await Promise.all([...urls].map((u) => cache.add(u).catch(() => undefined)));
      } catch (e) {
        /* офлайн при установке — не страшно */
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => undefined);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      return new Response('Нет сети', { status: 503, statusText: 'Offline' });
    })()
  );
});
