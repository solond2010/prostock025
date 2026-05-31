import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Zap, Check, Crown, Clock } from 'lucide-react';

// Precios (placeholder — ajustables). El pago se conecta en la Fase 4 (Stripe).
const PLANS = [
  { id: 'monthly', name: 'Mensual', price: '29€', per: '/mes', note: 'Cancela cuando quieras' },
  { id: 'annual', name: 'Anual', price: '290€', per: '/año', note: '2 meses gratis', highlight: true },
];

/** Aviso de días de prueba restantes (barra superior, solo durante el trial). */
export function TrialBanner() {
  const { isTrial, trialDaysLeft } = useSubscription();
  if (!isTrial) return null;
  return (
    <div className="w-full text-center text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-1.5"
      style={{ background: 'hsl(38 92% 46% / 0.12)', color: 'hsl(38,92%,42%)' }}>
      <Clock className="h-3.5 w-3.5" />
      {trialDaysLeft === 0
        ? 'Tu prueba termina hoy'
        : `Te quedan ${trialDaysLeft} ${trialDaysLeft === 1 ? 'día' : 'días'} de prueba gratuita`}
    </div>
  );
}

/** Pantalla de bloqueo a pantalla completa cuando el trial caduca y no hay suscripción. */
export function Paywall() {
  const { hasAccess, isLoading } = useSubscription();
  const { signOut } = useAuth();

  if (isLoading || hasAccess) return null;

  const choose = (plan: string) => {
    // En la Fase 4 esto abrirá Stripe Checkout.
    toast('Pagos disponibles muy pronto', {
      description: `Has elegido el plan ${plan === 'annual' ? 'anual' : 'mensual'}. La pasarela de pago se activa en breve.`,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md my-8">
        <div className="rounded-2xl border border-border/60 bg-card shadow-2xl p-7">
          {/* Brand + título */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden mb-3"
              style={{ background: 'linear-gradient(135deg, hsl(262,73%,55%), hsl(282,73%,62%))' }}>
              <Zap className="h-6 w-6 text-white" fill="white" strokeWidth={0} />
            </div>
            <h1 className="text-xl font-bold">Tu prueba gratuita ha terminado</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Elige un plan para seguir usando Flipr con todos tus datos.
            </p>
          </div>

          {/* Planes */}
          <div className="space-y-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => choose(p.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${
                  p.highlight ? 'border-primary/50 bg-primary/5' : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.highlight && <Crown className="h-4 w-4 text-primary" />}
                    <span className="font-semibold">{p.name}</span>
                    {p.highlight && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary">RECOMENDADO</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold tabular-nums">{p.price}</span>
                    <span className="text-xs text-muted-foreground">{p.per}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" /> {p.note}
                </p>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground/70 text-center mt-5">
            Tus datos están guardados y a salvo. Al suscribirte recuperas el acceso al instante.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-3"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
