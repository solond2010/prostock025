import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OWNER_ID } from '@/lib/owner';
import { useAdminProfiles, AdminProfile } from '@/hooks/useAdminProfiles';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Check, Clock, Ban, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  active:   { label: 'Activo',   color: 'hsl(var(--success))' },
  trial:    { label: 'Prueba',   color: 'hsl(38,92%,46%)' },
  past_due: { label: 'Impago',   color: 'hsl(0,72%,51%)' },
  canceled: { label: 'Bloqueado', color: 'hsl(0,72%,51%)' },
};

function accessLabel(p: AdminProfile) {
  if (p.status === 'active') return true;
  if (p.status === 'trial') return new Date(p.trial_ends_at).getTime() > Date.now();
  return false;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const { profiles, isLoading, update } = useAdminProfiles();

  if (loading) return null;
  if (!user || user.id !== OWNER_ID) return <Navigate to="/" replace />;

  const setActive = (id: string) =>
    update.mutate({ id, patch: { status: 'active' } }, { onSuccess: () => toast.success('Cuenta activada') });
  const setTrial = (id: string) =>
    update.mutate(
      { id, patch: { status: 'trial', trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString() } },
      { onSuccess: () => toast.success('Prueba de 7 días asignada') }
    );
  const extend = (id: string, current: string) =>
    update.mutate(
      { id, patch: { status: 'trial', trial_ends_at: new Date(Math.max(Date.now(), new Date(current).getTime()) + 7 * 86400000).toISOString() } },
      { onSuccess: () => toast.success('+7 días añadidos') }
    );
  const block = (id: string) =>
    update.mutate({ id, patch: { status: 'canceled' } }, { onSuccess: () => toast('Cuenta bloqueada') });

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title="Admin · Clientes"
        iconColor="violet"
        subtitle="Gestiona el acceso de cada usuario"
      />

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden" style={{ borderTop: '3px solid hsl(262,73%,55%)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acceso</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : profiles.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Sin usuarios todavía</td></tr>
              ) : (
                profiles.map((p) => {
                  const cfg = STATUS_CFG[p.status] ?? STATUS_CFG.canceled;
                  const access = accessLabel(p);
                  const isOwner = p.id === OWNER_ID;
                  return (
                    <tr key={p.id} className="table-row-premium">
                      <td className="px-4 py-3">
                        <span className="font-medium">{p.email ?? p.id.slice(0, 8) + '…'}</span>
                        {isOwner && <span className="ml-2 text-[10px] font-bold text-primary">(tú)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-lg text-[11px] font-bold whitespace-nowrap"
                          style={{ color: cfg.color, background: `${cfg.color}1f` }}>
                          {cfg.label}
                          {p.status === 'trial' && ` · ${new Date(p.trial_ends_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: access ? 'hsl(var(--success))' : 'hsl(0,72%,51%)' }}>
                          {access ? '✓ Con acceso' : '✕ Sin acceso'}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-success hover:bg-success/10" onClick={() => setActive(p.id)} disabled={update.isPending}>
                            <Check className="h-3 w-3 mr-1" />Activar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-amber-500 hover:bg-amber-500/10" onClick={() => setTrial(p.id)} disabled={update.isPending}>
                            <Clock className="h-3 w-3 mr-1" />Prueba 7d
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground hover:bg-muted/60" onClick={() => extend(p.id, p.trial_ends_at)} disabled={update.isPending}>
                            <CalendarPlus className="h-3 w-3 mr-1" />+7d
                          </Button>
                          {!isOwner && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10" onClick={() => block(p.id)} disabled={update.isPending}>
                              <Ban className="h-3 w-3 mr-1" />Bloquear
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Cuando un cliente te pague (Bizum, transferencia, etc.), pulsa <b>Activar</b>. Para cortar el acceso, <b>Bloquear</b>.
      </p>
    </div>
  );
}
