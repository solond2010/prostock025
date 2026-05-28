// Service Worker — ProStock Push Notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'ProStock', body: event.data.text() }; }

  const title = data.title || '🔥 Oferta nueva';
  const options = {
    body: data.body || 'Hay una oferta nueva en el feed',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: data.tag || 'prostock-deal',
    renotify: true,
    data: { url: data.url || '/ofertas' },
    actions: [
      { action: 'open', title: 'Ver oferta' },
      { action: 'dismiss', title: 'Ignorar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/ofertas';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); }
      else self.clients.openWindow(url);
    })
  );
});
