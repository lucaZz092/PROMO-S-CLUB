/**
 * Service Worker & Web Push API Integration Manager for PromoRadar
 * Enables native operating system notifications for price drops
 * even when the browser tab is minimized or in the background.
 */

const STORAGE_KEY_PUSH_SUB = 'promoradar_push_subscription_v1';

// Standard VAPID public key for Web Push demonstration & client-side push endpoints
const DEMO_VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

/**
 * Utility to convert base64 VAPID public key to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  subscribedAt: string;
}

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  pushSupported: boolean;
  pushSubscribed: boolean;
  permission: NotificationPermission;
  subscriptionEndpoint?: string;
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Registers the Service Worker (/sw.js)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[PromoRadar SW] Service Worker is not supported in this environment.');
    return null;
  }

  if (registrationPromise) {
    return registrationPromise;
  }

  registrationPromise = (async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PromoRadar SW] Registered successfully with scope:', reg.scope);

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PromoRadar SW] New Service Worker content available.');
            }
          });
        }
      });

      // Wait until the service worker is active
      await navigator.serviceWorker.ready;
      return reg;
    } catch (error) {
      console.error('[PromoRadar SW] Service Worker registration failed:', error);
      return null;
    }
  })();

  return registrationPromise;
}

/**
 * Gets the current active Service Worker Registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

/**
 * Checks overall status of Service Worker and Web Push API
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  const pushSupported = supported && 'PushManager' in window;
  const permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';

  if (!supported) {
    return {
      supported: false,
      registered: false,
      active: false,
      pushSupported: false,
      pushSubscribed: false,
      permission,
    };
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const isRegistered = !!reg;
    const isActive = !!reg?.active;

    let isPushSubscribed = false;
    let endpoint: string | undefined;

    if (pushSupported && reg) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        isPushSubscribed = true;
        endpoint = sub.endpoint;
      }
    }

    return {
      supported: true,
      registered: isRegistered,
      active: isActive,
      pushSupported,
      pushSubscribed: isPushSubscribed,
      permission,
      subscriptionEndpoint: endpoint,
    };
  } catch {
    return {
      supported: true,
      registered: false,
      active: false,
      pushSupported,
      pushSubscribed: false,
      permission,
    };
  }
}

/**
 * Subscribes user to Web Push API via Service Worker PushManager
 */
export async function subscribeToWebPush(
  vapidKey: string = DEMO_VAPID_PUBLIC_KEY
): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Web Push API não é suportada por este navegador.');
  }

  const reg = await getServiceWorkerRegistration();
  if (!reg) {
    throw new Error('Service Worker precisa estar registrado antes de ativar Web Push.');
  }

  // Request browser permission if not yet granted
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      throw new Error('Permissão de notificações foi negada no navegador.');
    }
  }

  try {
    // Check existing subscription first
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const convertedKey = urlBase64ToUint8Array(vapidKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    // Persist details for inspection
    const subJson = sub.toJSON();
    const pushData: PushSubscriptionData = {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
      subscribedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_PUSH_SUB, JSON.stringify(pushData));

    console.log('[PromoRadar Push] Web Push subscription active:', pushData);
    return sub;
  } catch (error) {
    console.error('[PromoRadar Push] Failed to subscribe to Web Push:', error);
    throw error;
  }
}

/**
 * Unsubscribes from Web Push API
 */
export async function unsubscribeFromWebPush(): Promise<boolean> {
  const reg = await getServiceWorkerRegistration();
  if (!reg) return false;

  try {
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const successful = await sub.unsubscribe();
      localStorage.removeItem(STORAGE_KEY_PUSH_SUB);
      return successful;
    }
    return true;
  } catch (err) {
    console.error('[PromoRadar Push] Failed to unsubscribe:', err);
    return false;
  }
}

/**
 * Dispatches a native OS notification through the Service Worker.
 * This guarantees display in macOS Notification Center, Windows Action Center,
 * and Linux/Android notification tray even when the tab is minimized or in the background.
 */
export async function dispatchNativeOSNotification(
  title: string,
  options: {
    body: string;
    dealId?: string;
    url?: string;
    tag?: string;
    price?: number;
    originalPrice?: number;
  }
): Promise<boolean> {
  const reg = await getServiceWorkerRegistration();

  const notificationOptions = {
    body: options.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    tag: options.tag || `promoradar-deal-${options.dealId || Date.now()}`,
    renotify: true,
    requireInteraction: true, // Key property: prevents the OS from prematurely auto-dismissing
    data: {
      url: options.url || '/',
      dealId: options.dealId,
      timestamp: Date.now(),
    },
    // Vibration pattern for mobile / Android devices
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'view_deal', title: '🛒 Ver Oferta Amazon' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };

  // Primary execution: Service Worker Registration showNotification (works natively in background/minimized)
  if (reg && 'showNotification' in reg) {
    try {
      await reg.showNotification(title, notificationOptions as NotificationOptions);

      // Also post message to active service worker controller as a redundancy signal
      if (reg.active) {
        reg.active.postMessage({
          type: 'SHOW_NATIVE_NOTIFICATION',
          payload: {
            title,
            body: options.body,
            dealId: options.dealId,
            url: options.url,
            tag: options.tag,
          },
        });
      }
      return true;
    } catch (err) {
      console.warn('[PromoRadar SW] reg.showNotification error, falling back:', err);
    }
  }

  // Fallback if Service Worker is not available
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options.body,
        icon: '/pwa-192x192.png',
        tag: options.tag,
      });
      return true;
    } catch (fallbackErr) {
      console.warn('[PromoRadar SW] HTML5 Notification fallback failed:', fallbackErr);
    }
  }

  return false;
}

/**
 * Schedules a native OS notification to fire after a delay (e.g. 3 or 5 seconds)
 * via the Service Worker background thread.
 * This is designed so users can click the test button, minimize the browser window,
 * and witness the native OS system notification pop up while the tab is minimized!
 */
export async function scheduleMinimizedTabTest(
  delaySeconds: number = 3,
  dealTitle: string = 'Samsung Galaxy S24 Ultra 5G',
  newPrice: number = 4499.0,
  discount: number = 38
): Promise<boolean> {
  const reg = await getServiceWorkerRegistration();
  if (!reg || !reg.active) {
    // If SW not active yet, wait or dispatch immediately
    await registerServiceWorker();
  }

  const activeReg = await getServiceWorkerRegistration();
  const worker = activeReg?.active || navigator.serviceWorker.controller;

  const payload = {
    delayMs: delaySeconds * 1000,
    title: `🚨 PromoRadar: Queda de Preço Detectada! (-${discount}%)`,
    body: `${dealTitle} despencou para R$ ${newPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na Amazon Brasil! Menor preço histórico!`,
    tag: `minimized-test-${Date.now()}`,
    data: {
      dealId: 'deal-galaxy-s24',
      url: '/',
      timestamp: Date.now(),
    },
  };

  if (worker) {
    worker.postMessage({
      type: 'SCHEDULED_NOTIFICATION',
      payload,
    });
    return true;
  }

  // If no active worker controller yet, use window timeout
  setTimeout(() => {
    dispatchNativeOSNotification(payload.title, {
      body: payload.body,
      dealId: 'deal-galaxy-s24',
      tag: payload.tag,
    });
  }, delaySeconds * 1000);

  return true;
}

/**
 * Subscribes to notification click messages broadcasted from sw.js
 */
export function onServiceWorkerNotificationClick(
  callback: (data: { dealId?: string; url?: string }) => void
): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NOTIFICATION_CLICKED') {
      callback({
        dealId: event.data.dealId,
        url: event.data.url,
      });
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}
