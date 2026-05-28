import { useRegisterSW } from 'virtual:pwa-register/react';
import { Zap, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export function PWAUpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Poll every 60 s for new SW in production
      if (r) {
        setInterval(() => r.update(), 60_000);
      }
    },
  });

  if (!needRefresh || dismissed) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up"
      style={{ width: 'min(calc(100vw - 2rem), 380px)' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl"
        style={{
          background: 'hsl(var(--card))',
          borderColor: 'hsl(var(--primary) / 0.3)',
          boxShadow: '0 8px 32px -4px hsl(262 73% 55% / 0.25), 0 0 0 1px hsl(var(--primary) / 0.15)',
        }}
      >
        {/* Icon */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}
        >
          <Zap className="h-4 w-4 text-white" fill="white" strokeWidth={0} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-none mb-0.5">Nueva versión disponible</p>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Flipr se ha actualizado con mejoras
          </p>
        </div>

        {/* Update button */}
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-bold text-white shrink-0 btn-primary-gradient"
        >
          <RefreshCw className="h-3 w-3" />
          Actualizar
        </button>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
