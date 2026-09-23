// PromoRadar Service Worker - Native OS Notifications & Web Push API Integration
const CACHE_NAME = 'promoradar-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/icon.svg',
  '/favicon.ico'
];

// Service Worker Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
});

// Service Worker Activation & Client Claim
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
    ])
  );
});

// Web Push API - Receives background push notifications from Push Service
self.addEventListener('push', (event) => {
  let payload = {
    title: '🚨 PromoRadar: Queda Histórica de Preço!',
    body: 'Um dos produtos monitorados na Amazon Brasil atingiu a menor cotação.',
    dealId: undefined,
    url: '/',
    tag: 'promoradar-push-deal'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    tag: payload.tag || `promoradar-deal-${payload.dealId || Date.now()}`,
    renotify: true,
    requireInteraction: true, // Native OS keeps notification visible in action center
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.url || '/',
      dealId: payload.dealId,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view_deal',
        title: '🛒 Ver Oferta Amazon'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Native Notification Click Handler - Focuses or opens the deal window even if minimized
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and broadcast event
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            dealId: notificationData.dealId,
            url: targetUrl
          });
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Notification Close Event
self.addEventListener('notificationclose', (event) => {
  // Can be used for analytics if needed
});

// Message Listener for Foreground & Background Tab Orchestration
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'PING') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'PONG', active: true });
    }
    return;
  }

  // Trigger native OS notification via Service Worker registration
  // This allows the OS to display it natively even if the browser tab is minimized
  if (type === 'SHOW_NATIVE_NOTIFICATION') {
    const title = payload?.title || 'PromoRadar Alerta';
    const options = {
      body: payload?.body || 'Queda de preço detectada na Amazon.',
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
      tag: payload?.tag || `price-alert-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: payload?.url || '/',
        dealId: payload?.dealId,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view_deal',
          title: '🛒 Ver Oferta Amazon'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ]
    };

    self.registration.showNotification(title, options);
  }

  // Scheduled Native OS Notification - perfect for testing while user minimizes the tab!
  if (type === 'SCHEDULED_NOTIFICATION') {
    const delayMs = payload?.delayMs || 3000;
    setTimeout(() => {
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/pwa-192x192.png',
        badge: '/favicon.ico',
        tag: payload.tag || `scheduled-test-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        vibrate: [300, 100, 300],
        data: payload.data || {},
        actions: [
          { action: 'view_deal', title: '🛒 Ver Oferta' },
          { action: 'dismiss', title: 'Fechar' }
        ]
      });
    }, delayMs);
  }
});

// Cache-first for static icons and assets, network-first for pages
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET or cross-origin external API requests
  if (event.request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // For static icons and manifest, serve from cache if available
  if (url.pathname.match(/\.(png|svg|ico|json)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
