const CACHE = 'objectifs-v1';
const FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Mes Objectifs', {
      body: data.body || 'Tu as des objectifs à compléter aujourd\'hui !',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [100, 50, 100],
      data: { url: '/' },
      actions: [
        { action: 'done', title: 'C\'est fait ✓' },
        { action: 'later', title: 'Plus tard' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action !== 'later') {
    e.waitUntil(clients.openWindow('/'));
  }
});
