import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Franja fija que aparece cuando el dispositivo pierde la conexión, para que
 * el usuario entienda por qué los datos no cargan/actualizan.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] pt-safe">
      <div className="flex items-center justify-center gap-2 h-9 text-xs font-semibold text-white"
        style={{ background: 'hsl(0 72% 48%)' }}>
        <WifiOff className="h-3.5 w-3.5" />
        Sin conexión — los datos pueden no estar actualizados
      </div>
    </div>
  );
}
