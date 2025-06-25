import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
    permission: 'Notification' in window ? Notification.permission : 'denied',
    subscription: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    // Провери тренутну претплату
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setState(prev => ({ ...prev, subscription }));
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };

    checkSubscription();
  }, [state.isSupported]);

  // Захтевај дозволу за нотификације
  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Претплати се на push нотификације
  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!state.isSupported || state.permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID кључ (у продукцији користите прави кључ)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LdNiVfQUjSrFzIvjSITfXBHRVxuSLr1oCNgVRqhHBD0CKs8Uw8s';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setState(prev => ({ ...prev, subscription }));
      
      // Овде бисте послали претплату на ваш сервер
      console.log('Push subscription:', subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  // Откажи претплату
  const unsubscribe = async (): Promise<boolean> => {
    if (!state.subscription) return false;

    try {
      const success = await state.subscription.unsubscribe();
      if (success) {
        setState(prev => ({ ...prev, subscription: null }));
      }
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  // Пошаљи локалну нотификацију
  const showLocalNotification = (title: string, options?: NotificationOptions) => {
    if (state.permission === 'granted') {
      new Notification(title, {
        icon: '/apple-touch-icon.png',
        badge: '/favicon.svg',
        ...options,
      });
    }
  };

  // Закажи подсетник
  const scheduleReminder = (title: string, message: string, delay: number) => {
    setTimeout(() => {
      showLocalNotification(title, {
        body: message,
        tag: 'reminder',
        requireInteraction: true,
      });
    }, delay);
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
    scheduleReminder,
  };
};

// Helper функција за конверзију VAPID кључа
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}