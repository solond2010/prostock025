import { useState } from 'react';
import { Bot, Square, RefreshCw, Clock, Search, MessageCircle, Eye, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useBotStatus, isBotOnline } from '@/hooks/useBotStatus';
import { useToast } from '@/hooks/use-toast';

const SEARCHES_INFO = [
  { name: 'iphone pantalla rota', emoji: '💥', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/25' },
  { name: 'iphone roto',          emoji: '🔧', color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/25' },
  { name: 'iphone chollo 30km',   emoji: '⚡', color: 'text-success',     bg: 'bg-success/10 border-success/25' },
];

export default function BotControl() {
  const { status, isLoading, online, sendCommand } = useBotStatus();
  const { toast } = useToast();
  const [confirmStop, setConfirmStop] = useState(false);

  const handleStop = async () => {
    setConfirmStop(false);
    sendCommand.mutate('stop', {
      onSuccess: () => toast({
        title: '🛑 Comando enviado',
        description: 'El bot se detendrá en menos de 20 segundos.',
      }),
      onError: () => toast({
        title: 'Error',
        description: 'No se pudo enviar el comando al bot.',
        variant: 'destructive',
      }),
    });
  };

  const lastSeen = status?.updated_at
    ? formatDistanceToNow(new Date(status.updated_at), { locale: es, addSuffix: true })
    : null;

  const nextSearch = status?.next_search_at
    ? new Date(status.next_search_at)
    : null;
  const nextSearchIn = nextSearch && nextSearch > new Date()
    ? Math.ceil((nextSearch.getTime() - Date.now()) / 1000)
    : null;

  const uptime = status?.started_at
    ? formatDistanceToNow(new Date(status.started_at), { locale: es })
    : null;

  const logs = status?.last_logs
    ? status.last_logs.split('\n').filter(Boolean).reverse()
    : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
            online ? 'bg-success/10 border-success/20' : 'bg-muted/60 border-border/60'
          }`}>
            <Bot className={`h-6 w-6 ${online ? 'text-success' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Panel del Bot
              {isLoading ? (
                <Skeleton className="h-5 w-16 rounded-full" />
              ) : online ? (
                <Badge className="bg-success/15 text-success border-success/30 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse mr-1" />
                  ONLINE
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  OFFLINE
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              {lastSeen ? `Última actividad ${lastSeen}` : 'Sin datos del bot aún'}
            </p>
          </div>
        </div>

        {/* Botón stop */}
        {online && (
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
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        )) : (<>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">Búsquedas hoy</span>
              </div>
              <p className="text-2xl font-bold">{status?.searches_today ?? 0}</p>
              {uptime && <p className="text-[11px] text-muted-foreground mt-0.5">activo {uptime}</p>}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-3.5 w-3.5 text-success" />
                <span className="text-xs text-muted-foreground font-medium">Mensajes hoy</span>
              </div>
              <p className="text-2xl font-bold text-success">{status?.messages_today ?? 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">enviados por el bot</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium">Anuncios vistos</span>
              </div>
              <p className="text-2xl font-bold">{status?.items_seen_today ?? 0}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">acumulado total</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Próxima búsqueda</span>
              </div>
              {online && nextSearchIn !== null ? (
                <>
                  <p className="text-2xl font-bold">{nextSearchIn}s</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    a las {nextSearch ? format(nextSearch, 'HH:mm:ss') : '—'}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Búsquedas activas */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" /> Búsquedas activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {SEARCHES_INFO.map(s => (
              <div key={s.name} className={`flex items-center gap-3 p-3 rounded-xl border ${s.bg}`}>
                <span className="text-xl">{s.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${s.color}`}>{s.name}</p>
                </div>
                <CheckCircle2 className={`h-4 w-4 ${s.color} opacity-80`} />
              </div>
            ))}

            {/* Blacklist info */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[11px] text-muted-foreground font-medium mb-2">
                🚫 Blacklist activa (chollo 30km)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['watch', 'airpod', 'funda', 'cargador', 'cable', 'auricular', 'ipad', 'pencil', 'macbook', 'accesor', 'correa', 'carcasa'].map(w => (
                  <Badge key={w} variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado detallado */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4" /> Estado del proceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
              </div>
            ) : status ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">Estado</span>
                  <span className={`text-xs font-bold ${online ? 'text-success' : 'text-destructive'}`}>
                    {online ? '● Online' : '● Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <span className="text-xs text-muted-foreground">PID proceso</span>
                  <span className="text-xs font-mono font-medium">{status.pid ?? '—'}</span>
                </div>
                {status.started_at && (
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-xs text-muted-foreground">Arrancado</span>
                    <span className="text-xs font-medium">
                      {format(new Date(status.started_at), 'dd/MM HH:mm')}
                    </span>
                  </div>
                )}
                {status.last_search_at && (
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <span className="text-xs text-muted-foreground">Última búsqueda</span>
                    <span className="text-xs font-medium">
                      {format(new Date(status.last_search_at), 'HH:mm:ss')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-muted-foreground">Última actualización</span>
                  <span className="text-xs font-medium">{lastSeen}</span>
                </div>

                {!online && status.updated_at && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-500">Bot detenido o sin conexión</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Arranca el bot desde tu Mac: <code className="bg-muted px-1 rounded text-[10px]">node check_deals.js</code>
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bot className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Sin datos del bot aún</p>
                <p className="text-xs mt-1 opacity-70">Arranca el bot para ver el estado aquí</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log viewer */}
      {logs.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Últimos logs
              <Badge variant="outline" className="text-[10px] h-5">{logs.length} líneas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/40 rounded-xl border border-border/40 p-3 max-h-72 overflow-y-auto font-mono text-[11px] space-y-0.5">
              {logs.map((line, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    line.includes('❌') || line.includes('⚠️') ? 'text-destructive' :
                    line.includes('✅') || line.includes('🔔') ? 'text-success' :
                    line.includes('📤') || line.includes('🆕') ? 'text-primary' :
                    line.includes('🚫') ? 'text-amber-500' :
                    'text-muted-foreground'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm stop dialog */}
      <AlertDialog open={confirmStop} onOpenChange={setConfirmStop}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Parar el bot?</AlertDialogTitle>
            <AlertDialogDescription>
              El bot dejará de buscar anuncios en Wallapop. Para volver a arrancarlo
              tendrás que hacerlo desde tu Mac (<code className="bg-muted px-1 rounded text-xs">node check_deals.js</code>).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, parar bot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
