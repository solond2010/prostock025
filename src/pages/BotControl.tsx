import { useState } from 'react';
import { Bot, Square, Search, MessageCircle, Eye, Clock, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { useBotStatus } from '@/hooks/useBotStatus';
import { useToast } from '@/hooks/use-toast';

const SEARCHES_INFO = [
  { name: 'iphone pantalla rota', emoji: '💥', accent: 'hsl(var(--destructive))', bg: 'hsl(var(--destructive) / 0.08)', border: 'hsl(var(--destructive) / 0.25)' },
  { name: 'iphone roto',          emoji: '🔧', accent: 'hsl(38,92%,46%)',          bg: 'hsl(38 92% 46% / 0.08)',          border: 'hsl(38 92% 46% / 0.25)' },
  { name: 'iphone chollo 30km',   emoji: '⚡', accent: 'hsl(var(--success))',      bg: 'hsl(var(--success) / 0.08)',      border: 'hsl(var(--success) / 0.25)' },
];

const BLACKLIST = ['watch', 'airpod', 'funda', 'cargador', 'cable', 'auricular', 'ipad', 'pencil', 'macbook', 'accesor', 'correa', 'carcasa'];

export default function BotControl() {
  const { status, isLoading, online, sendCommand } = useBotStatus();
  const { toast } = useToast();
  const [confirmStop, setConfirmStop] = useState(false);

  const handleStop = async () => {
    setConfirmStop(false);
    sendCommand.mutate('stop', {
      onSuccess: () => toast({ title: '🛑 Comando enviado', description: 'El bot se detendrá en menos de 20 segundos.' }),
      onError: () => toast({ title: 'Error', description: 'No se pudo enviar el comando al bot.', variant: 'destructive' }),
    });
  };

  const lastSeen = status?.updated_at
    ? formatDistanceToNow(new Date(status.updated_at), { locale: es, addSuffix: true })
    : null;

  const nextSearch = status?.next_search_at ? new Date(status.next_search_at) : null;
  const nextSearchIn = nextSearch && nextSearch > new Date()
    ? Math.ceil((nextSearch.getTime() - Date.now()) / 1000)
    : null;

  const uptime = status?.started_at
    ? formatDistanceToNow(new Date(status.started_at), { locale: es })
    : null;

  const logs = status?.last_logs
    ? status.last_logs.split('\n').filter(Boolean).reverse()
    : [];

  const statusBadge = isLoading ? (
    <Skeleton className="h-5 w-16 rounded-full" />
  ) : online ? (
    <Badge className="bg-success/15 text-success border-success/30 text-[10px] font-bold">
      <span className="status-dot-online mr-1.5" />
      ONLINE
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground text-[10px]">OFFLINE</Badge>
  );

  const kpis = [
    {
      icon: Search,
      label: 'Búsquedas hoy',
      value: status?.searches_today ?? 0,
      sub: uptime ? `activo ${uptime}` : '—',
      accent: 'hsl(262,73%,55%)',
    },
    {
      icon: MessageCircle,
      label: 'Mensajes enviados',
      value: status?.messages_today ?? 0,
      sub: 'por el bot hoy',
      accent: 'hsl(160,84%,38%)',
    },
    {
      icon: Eye,
      label: 'Anuncios vistos',
      value: status?.items_seen_today ?? 0,
      sub: 'acumulado total',
      accent: 'hsl(38,92%,46%)',
    },
    {
      icon: Clock,
      label: 'Próxima búsqueda',
      value: online && nextSearchIn !== null ? `${nextSearchIn}s` : '—',
      sub: nextSearch && online ? `a las ${format(nextSearch, 'HH:mm:ss')}` : 'sin datos',
      accent: 'hsl(217,91%,54%)',
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      <PageHeader
        icon={Bot}
        title="Panel del Bot"
        subtitle={lastSeen ? `Última actividad ${lastSeen}` : 'Sin datos del bot aún'}
        iconColor={online ? 'green' : 'violet'}
        badge={statusBadge}
        actions={
          online ? (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmStop(true)}
              disabled={sendCommand.isPending}
            >
              <Square className="h-3.5 w-3.5 mr-1.5" />
              Parar bot
            </Button>
          ) : undefined
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up-1">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="kpi-card p-4" style={{ borderTop: `3px solid ${kpi.accent}` }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${kpi.accent}18` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: kpi.accent }} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium leading-tight">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold leading-none" style={{ color: kpi.accent }}>{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{kpi.sub}</p>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-slide-up-2">

        {/* Búsquedas activas */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Búsquedas activas</span>
            <Badge variant="outline" className="ml-auto text-[10px] h-5">{SEARCHES_INFO.length} activas</Badge>
          </div>
          <div className="p-4 space-y-2">
            {SEARCHES_INFO.map(s => (
              <div
                key={s.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <span className="text-lg leading-none">{s.emoji}</span>
                <p className="flex-1 text-sm font-semibold" style={{ color: s.accent }}>{s.name}</p>
                <CheckCircle2 className="h-4 w-4 opacity-70" style={{ color: s.accent }} />
              </div>
            ))}

            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground font-semibold mb-2">🚫 Blacklist — chollo 30km</p>
              <div className="flex flex-wrap gap-1.5">
                {BLACKLIST.map(w => (
                  <span key={w} className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-medium border border-border/60 text-muted-foreground bg-muted/40">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Estado del proceso */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Estado del proceso</span>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
              </div>
            ) : status ? (
              <div className="space-y-0">
                {[
                  {
                    label: 'Estado',
                    value: online ? '● Online' : '● Offline',
                    valueClass: online ? 'text-success font-bold' : 'text-destructive font-bold',
                  },
                  { label: 'PID proceso', value: status.pid ?? '—', valueClass: 'font-mono' },
                  status.started_at ? { label: 'Arrancado', value: format(new Date(status.started_at), 'dd/MM HH:mm'), valueClass: '' } : null,
                  status.last_search_at ? { label: 'Última búsqueda', value: format(new Date(status.last_search_at), 'HH:mm:ss'), valueClass: '' } : null,
                  { label: 'Actualización', value: lastSeen ?? '—', valueClass: '' },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="table-row-premium flex items-center justify-between py-2.5 px-1">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className={`text-xs ${row.valueClass}`}>{row.value}</span>
                  </div>
                ))}

                {!online && status.updated_at && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl mt-3" style={{ background: 'hsl(38 92% 46% / 0.08)', border: '1px solid hsl(38 92% 46% / 0.25)' }}>
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'hsl(38,92%,46%)' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'hsl(38,92%,46%)' }}>Bot detenido o sin conexión</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Arranca desde tu Mac: <code className="bg-muted px-1 rounded text-[10px]">node check_deals.js</code>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Bot className="h-10 w-10 mb-3 opacity-15" />
                <p className="text-sm font-medium">Sin datos del bot</p>
                <p className="text-xs mt-1 opacity-60">Arranca el bot para ver el estado aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log viewer */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden animate-slide-up-3">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Últimos logs</span>
            <Badge variant="outline" className="ml-auto text-[10px] h-5">{logs.length} líneas</Badge>
          </div>
          <div className="p-3">
            <div className="rounded-xl bg-[hsl(var(--card))] border border-border/30 p-3 max-h-64 overflow-y-auto font-mono text-[11px] space-y-0.5"
              style={{ background: 'hsl(220 13% 10% / 0.5)' }}>
              {logs.map((line, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    line.includes('❌') || line.includes('⚠️') ? 'text-destructive' :
                    line.includes('✅') || line.includes('🔔') ? 'text-success' :
                    line.includes('📤') || line.includes('🆕') ? 'text-primary' :
                    line.includes('🚫') ? '' :
                    'text-muted-foreground/70'
                  }`}
                  style={line.includes('🚫') ? { color: 'hsl(38,92%,46%)' } : undefined}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm stop */}
      <AlertDialog open={confirmStop} onOpenChange={setConfirmStop}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Parar el bot?</AlertDialogTitle>
            <AlertDialogDescription>
              El bot dejará de buscar anuncios. Para volver a arrancarlo tendrás que hacerlo desde tu Mac:{' '}
              <code className="bg-muted px-1 rounded text-xs">node check_deals.js</code>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStop} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, parar bot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
