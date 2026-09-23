import { InAppNotification, NotificationSettings } from '../types';
import {
  dispatchNativeOSNotification,
  getServiceWorkerRegistration,
  registerServiceWorker,
  subscribeToWebPush,
} from './serviceWorkerManager';

const STORAGE_KEY_NOTIFICATIONS = 'promoradar_notifications_v1';
const STORAGE_KEY_SETTINGS = 'promoradar_notification_settings_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  browserPushEnabled: false,
  soundEnabled: true,
  minDiscountThreshold: 25,
  alertOnLowestEver: true,
  trackedStores: ['amazon'],
  trackedCategories: ['smartphones', 'hardware', 'audio', 'peripherals', 'wearables', 'games', 'smarthome'],
};

// Play a subtle high-frequency chime using Web Audio API (no external MP3 asset dependency)
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export function getStoredNotifications(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      // Default welcome notification
      const welcome: InAppNotification[] = [
        {
          id: 'welcome-1',
          title: 'Radar Amazon Afiliados Ativado!',
          message: 'Monitorando produtos e promoções da Amazon Brasil em tempo real com links e tag de afiliado.',
          timestamp: 'Agora',
          read: false,
          type: 'system',
        },
      ];
      return welcome;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredNotifications(notifications: InAppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch {
    // quota exceeded or private mode
  }
}

export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveStoredNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // quota exceeded or private mode
  }
}

export async function requestBrowserPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  // Ensure Service Worker is active
  await registerServiceWorker().catch((err) => {
    console.warn('[PromoRadar SW] Pre-registration warning:', err);
  });

  const perm = await Notification.requestPermission();

  if (perm === 'granted') {
    // Automatically initialize PushManager subscription in the background
    try {
      await subscribeToWebPush();
    } catch (e) {
      console.warn('[PromoRadar Push] Background subscription init warning:', e);
    }
  }

  return perm;
}

export function sendPushAlert(
  title: string,
  body: string,
  options?: { dealId?: string; tag?: string; url?: string; price?: number; originalPrice?: number }
): void {
  const settings = getStoredNotificationSettings();

  if (settings.soundEnabled) {
    playChimeSound();
  }

  // Dispatch native OS notification via Service Worker (works natively even when tab is minimized)
  if ('Notification' in window && Notification.permission === 'granted' && settings.browserPushEnabled) {
    dispatchNativeOSNotification(title, {
      body,
      dealId: options?.dealId,
      tag: options?.tag || `promoradar-alert-${options?.dealId || Date.now()}`,
      url: options?.url || '/',
      price: options?.price,
      originalPrice: options?.originalPrice,
    }).catch((err) => {
      console.warn('[PromoRadar SW] Failed to dispatch native notification:', err);
    });
  }

  // Always record into in-app notification center
  const existing = getStoredNotifications();
  const newNotif: InAppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    message: body,
    timestamp: 'Agora',
    dealId: options?.dealId,
    read: false,
    type: 'price_drop',
  };

  saveStoredNotifications([newNotif, ...existing.slice(0, 49)]);
}
