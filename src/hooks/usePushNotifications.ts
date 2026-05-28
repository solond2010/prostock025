import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const VAPID_PUBLIC_KEY = 'BCeFbqU6vK5wVPza7bGYG1uWesn4ZMe-F5apPDHvdEdOXgIm0-AB3cR_9aWMwtgR3nfI0zhFe4bdIv3cpEkkuSg';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supported = 'serviceWorker' in navigator && 'PushManager' in window;

  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission);

    // Registrar SW
    navigator.serviceWorker.register('/sw.js').catch(() => {});

    // Comprobar si ya hay suscripción activa
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => {
      setIsSubscribed(!!sub);
    }).catch(() => {});
  }, []);

  const subscribe = async () => {
    if (!supported || !user) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      await supabase.from('push_subscriptions' as any).upsert({
        user_id: user.id,
        subscription: subJson,
      }, { onConflict: 'user_id' });

      setPermission('granted');
      setIsSubscribed(true);
    } catch (e) {
      console.error('Push subscribe error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!supported || !user) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await supabase.from('push_subscriptions' as any).delete().eq('user_id', user.id);
      setIsSubscribed(false);
    } catch (e) {
      console.error('Push unsubscribe error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return { supported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
