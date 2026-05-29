/* eslint-disable */
// ───────────────────────────────────────────────────────────────────────────
// Flipr — Push notifications handler
// Este archivo lo carga el Service Worker de Workbox vía importScripts('push-sw.js').
// Mantener separado de sw.js: Workbox GENERA sw.js en cada build y lo sobrescribiría.
// ───────────────────────────────────────────────────────────────────────────

// Mapa de búsquedas → estilo de la notificación.
// El bot envía data.search (o data.tag) y aquí lo formateamos bonito.
function searchStyle(raw) {
  const s = (raw || '').toLowerCase();
  if (s.includes('pantalla')) {
    return { emoji: '💥', label: 'Pantalla rota', tag: 'flipr-pantalla' };
  }
  if (s.includes('roto')) {
    return { emoji: '🔧', label: 'iPhone roto', tag: 'flipr-roto' };
  }
  if (s.includes('chollo')) {
    return { emoji: '⚡', label: 'Chollo 30km', tag: 'flipr-chollo' };
  }
  return { emoji: '🔥', label: 'Oferta nueva', tag: 'flipr-deal' };
}

self.addEventListener('push', function (event) {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); }
    catch (e) { data = { body: event.data.text() }; }
  }

  const style = searchStyle(data.search || data.tag || data.title);

  // Título: si el bot manda uno explícito lo respetamos, si no lo componemos.
  const title = data.title || `${style.emoji} ${style.label}`;

  const options = {
    body: data.body || 'Toca para ver la oferta',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    // Tag por tipo de búsqueda: agrupa por categoría pero pantalla/roto/chollo
    // no se pisan entre sí. renotify:true vibra/suena aunque haya una previa.
    tag: data.tag || style.tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [120, 60, 120],
    timestamp: Date.now(),
    data: {
      url: data.url || '/ofertas',
      search: data.search || style.label,
    },
    actions: [
      { action: 'open', title: 'Ver oferta' },
      { action: 'dismiss', title: 'Ignorar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = (event.notification.data && event.notification.data.url) || '/ofertas';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clients) {
        // Si ya hay una ventana de la app abierta, la enfocamos y navegamos.
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if ('navigate' in client) client.navigate(url);
            return;
          }
        }
        // Si no, abrimos una nueva.
        return self.clients.openWindow(url);
      })
  );
});
