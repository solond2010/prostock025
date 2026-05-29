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

// iOS (incl. iPadOS que se hace pasar por Mac) instalado en pantalla de inicio.
function detectStandalone() {
  const iosStandalone = (window.navigator as any).standalone === true;
  const displayStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches === true;
  return iosStandalone || displayStandalone;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isIOS =
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    // iPadOS 13+ se reporta como Mac con pantalla táctil
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isStandalone = detectStandalone();
  // En navegador hace falta SW + PushManager. En iOS además debe estar instalada.
  const hasPushApi = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const supported = hasPushApi && (!isIOS || isStandalone);
  // iOS en Safari pero sin instalar como PWA → hay que añadir a pantalla de inicio.
  const needsInstall = isIOS && !isStandalone;

  useEffect(() => {
    if (!hasPushApi) return;
    setPermission(Notification.permission);
    // No registramos el SW aquí: vite-plugin-pwa ya lo registra (/sw.js).
    // Esperamos a que esté listo y comprobamos si hay suscripción.
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [hasPushApi]);

  const subscribe = async () => {
    if (!user || !hasPushApi) return;
    setIsLoading(true);
    try {
      // 1) Pedir permiso explícitamente (requerido en iOS, debe venir de un gesto).
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;

      // 2) Si ya hay una suscripción vieja (p.ej. con otra clave VAPID), la limpiamos.
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        try { await existing.unsubscribe(); } catch { /* noop */ }
      }

      // 3) Suscribir con la clave actual.
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions' as any).upsert({
        user_id: user.id,
        subscription: subJson,
      }, { onConflict: 'user_id' });
      if (error) throw error;

      setIsSubscribed(true);
    } catch (e) {
      console.error('Push subscribe error:', e);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!user || !hasPushApi) return;
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

  return { supported, needsInstall, isIOS, isStandalone, permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
