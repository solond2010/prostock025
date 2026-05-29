import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function PWAUpdatePrompt() {
  const { toast } = useToast();

  useRegisterSW({
    onRegistered(r) {
      // Comprueba actualizaciones cada 60 s
      if (r) setInterval(() => r.update(), 60_000);
    },
    onOfflineReady() {
      // App lista para uso offline
    },
    onNeedRefresh() {
      // Con autoUpdate, el SW ya hace skipWaiting automáticamente.
      // Avisamos al usuario con un toast y recargamos.
      toast({
        title: '⚡ App actualizada',
        description: 'Recargando con la última versión...',
        duration: 2500,
      });
      setTimeout(() => window.location.reload(), 2500);
    },
  });

  return null;
}
