// FarmDesk service worker: makes the app installable and lets it open without a connection.
// Network first, so every player always gets the newest version; the cache is only a fallback.
// Only this site's own files are cached; the shared database (Supabase) is never touched here.
const CACHE = 'farmdesk-shell-v3';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', './index.html'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('farmdesk-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL('./', self.location).pathname)) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request, { ignoreSearch: request.mode === 'navigate' }).then(hit => hit || caches.match('./'))));
});

// Push notifications from the farmdesk-notify Edge Function.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'FarmDesk', body: event.data && event.data.text() }; }
  const title = data.title || 'FarmDesk';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    tag: data.tag || undefined,
    renotify: !!data.tag,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: { url: data.url || './' }
  }));
});

// Tapping a notification opens FarmDesk (or focuses it) on the farm it is about.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const app = list.find(c => c.url.startsWith(new URL('./', self.location).href));
    if (app) return app.focus().then(c => c.navigate ? c.navigate(target) : c);
    return self.clients.openWindow(target);
  }));
});
