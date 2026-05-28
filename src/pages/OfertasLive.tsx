import { useState } from 'react';
import { Target, Flame, ExternalLink, MessageSquare, Archive, Radio, Zap, Brain, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, Deal } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';

const SCORE_CONFIG: Record<Deal['score'], { label: string; className: string; dotClass: string }> = {
  fire: {
    label: 'PRECIO BRUTAL',
    className: 'bg-destructive/15 text-destructive border-destructive/30 font-bold',
    dotClass: 'text-destructive',
  },
  good: {
    label: 'BUEN PRECIO',
    className: 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold',
    dotClass: 'text-amber-500',
  },
  ok: {
    label: 'OK',
    className: 'bg-primary/10 text-primary border-primary/20 font-bold',
    dotClass: 'text-primary',
  },
};

const OfertasLive = () => {
  const { toast } = useToast();
  const [onlyFire, setOnlyFire] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const { deals, isLoading, markSent, archive } = useDeals({ onlyFire, maxPrice });

  const handleContact = (deal: Deal) => {
    window.open(deal.item_url, '_blank');
    toast({
      title: '⚡ Wallapop abierto',
      description: '¿Has enviado el mensaje? Pulsa "Marcar como enviado" cuando lo hayas hecho.',
      duration: 10000,
    });
  };

  const handleMarkSent = (deal: Deal) => {
    markSent.mutate(deal.id, {
      onSuccess: () =>
        toast({ title: '✅ Marcado como enviado', description: 'El trato está en curso.' }),
    });
  };

  const stats = {
    today: deals.filter((d) => Date.now() - new Date(d.created_at).getTime() < 24 * 60 * 60 * 1000).length,
    sent: deals.filter((d) => d.message_status === 'sent').length,
    pending: deals.filter((d) => d.message_status === 'pending').length,
    replied: deals.filter((d) => d.message_status !== 'pending' && d.message_status !== 'failed').length,
    fire: deals.filter((d) => d.score === 'fire').length,
  };

  const replyRate = stats.sent > 0 ? Math.round((stats.replied / stats.sent) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
            <Target className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              En directo
              <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px] font-bold px-2">
                <Radio className="h-2.5 w-2.5 mr-1 animate-pulse" /> EN VIVO
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              El bot encuentra ofertas y aparecen aquí en tiempo real
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
              🔥 Hoy
            </div>
            <div className="text-2xl font-bold">{stats.today}</div>
            <div className="text-xs text-muted-foreground mt-0.5">ofertas nuevas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
              💬 Mensajes
            </div>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <div className="text-xs text-muted-foreground mt-0.5">enviados hoy · {stats.pending} restantes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
              ✅ Respuestas
            </div>
            <div className={`text-2xl font-bold ${stats.replied > 0 ? 'text-success' : ''}`}>{stats.replied}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{replyRate}% tasa respuesta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
              🤖 Bot
            </div>
            <div className="text-xl font-bold text-success flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Activo
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">cada 2 min</div>
          </CardContent>
        </Card>
      </div>

      {/* Feed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Feed de ofertas
              <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px] font-bold">
                LIVE
              </Badge>
              <span className="text-xs font-normal text-muted-foreground">
                {deals.length} {deals.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </CardTitle>
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={onlyFire ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOnlyFire((v) => !v)}
              >
                <Flame className="h-3 w-3 mr-1" /> Solo fuego
              </Button>
              <Button
                variant={maxPrice === 100 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMaxPrice(maxPrice === 100 ? undefined : 100)}
              >
                ≤ 100€
              </Button>
              <Button
                variant={maxPrice === 200 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMaxPrice(maxPrice === 200 ? undefined : 200)}
              >
                ≤ 200€
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {isLoading && (
            <>{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</>
          )}

          {!isLoading && deals.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Aún no hay ofertas</p>
              <p className="text-xs mt-1 opacity-70">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
            </div>
          )}

          {deals.map((deal) => {
            const score = SCORE_CONFIG[deal.score];
            const isFresh = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
            const isSent = deal.message_status === 'sent';
            const timeAgo = formatDistanceToNow(new Date(deal.created_at), { locale: es });
            const sentTime = deal.message_sent_at
              ? format(new Date(deal.message_sent_at), 'HH:mm')
              : null;

            return (
              <div
                key={deal.id}
                className={`flex gap-3 p-3.5 rounded-xl border transition-all ${
                  isFresh
                    ? 'border-destructive/40 bg-destructive/5 shadow-sm'
                    : 'border-border hover:bg-secondary/40'
                }`}
              >
                {/* Imagen */}
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted/60 flex items-center justify-center text-2xl shrink-0">
                    📱
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Título y precio */}
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <p className="font-semibold text-sm leading-snug line-clamp-2">{deal.title}</p>
                    <p className="font-bold text-lg whitespace-nowrap leading-tight">
                      {deal.price != null ? `${deal.price} €` : '—'}
                    </p>
                  </div>

                  {/* Badge + meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className={`${score.className} text-[10px] h-5 px-2`}>
                      🔥 {score.label}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      hace {timeAgo}
                      {deal.location ? ` · ${deal.location}` : ''}
                      {deal.seller_id ? ` · usuario nuevo` : ''}
                    </span>
                  </div>

                  {/* Descripción */}
                  {deal.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {deal.description}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2">
                    {isSent ? (
                      <>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 h-7 px-3 text-xs">
                          ✅ Mensaje enviado{sentTime ? ` · ${sentTime}` : ''}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                          <a href={deal.item_url} target="_blank" rel="noreferrer">
                            <MessageCircle className="h-3 w-3 mr-1" /> Ver conversación
                          </a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-primary hover:bg-primary/90"
                          onClick={() => handleContact(deal)}
                        >
                          <Zap className="h-3 w-3 mr-1" /> Abrir en Wallapop
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-success border-success/40 hover:bg-success/10"
                          onClick={() => handleMarkSent(deal)}
                          disabled={markSent.isPending}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" /> Marcar enviado
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                      <a href={deal.item_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" /> Ver en Wallapop
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => archive.mutate(deal.id)}
                      title="Archivar"
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfertasLive;
