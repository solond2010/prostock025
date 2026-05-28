import { useState } from 'react';
import { Target, Flame, ExternalLink, MessageSquare, Archive, Radio, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, Deal } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';

const SCORE_LABELS: Record<Deal['score'], { label: string; className: string; emoji: string }> = {
  fire: { label: 'Precio brutal', className: 'bg-destructive/10 text-destructive border-destructive/20', emoji: '🔥' },
  good: { label: 'Buen precio', className: 'bg-warning/10 text-warning border-warning/20', emoji: '⭐' },
  ok: { label: 'OK', className: 'bg-primary/10 text-primary border-primary/20', emoji: '📦' },
};

const OfertasLive = () => {
  const { toast } = useToast();
  const [onlyFire, setOnlyFire] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const { deals, isLoading, markSent, archive } = useDeals({ onlyFire, maxPrice });

  const handleContact = (deal: Deal) => {
    // Abre Wallapop con el deal y marca como enviado (modo manual)
    window.open(deal.item_url, '_blank');
    markSent.mutate(deal.id, {
      onSuccess: () =>
        toast({ title: 'Marcado como contactado', description: 'Recuerda enviar el mensaje en Wallapop.' }),
    });
  };

  const stats = {
    today: deals.filter((d) => Date.now() - new Date(d.created_at).getTime() < 24 * 60 * 60 * 1000).length,
    sent: deals.filter((d) => d.message_status === 'sent').length,
    fire: deals.filter((d) => d.score === 'fire').length,
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20">
            <Target className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              En directo
              <Badge variant="outline" className="border-destructive/30 text-destructive">
                <Radio className="h-3 w-3 mr-1 animate-pulse" /> EN VIVO
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              El bot encuentra ofertas y aparecen aquí en tiempo real
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Últimas 24 h</div>
            <div className="text-2xl font-bold">{stats.today}</div>
            <div className="text-xs text-muted-foreground mt-1">ofertas nuevas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Enviados</div>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <div className="text-xs text-muted-foreground mt-1">mensajes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Flame className="h-3 w-3 text-destructive" /> Precio brutal
            </div>
            <div className="text-2xl font-bold text-destructive">{stats.fire}</div>
            <div className="text-xs text-muted-foreground mt-1">en feed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">Bot</div>
            <div className="text-2xl font-bold text-success flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
              Activo
            </div>
            <div className="text-xs text-muted-foreground mt-1">cada 2 min</div>

          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={onlyFire ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOnlyFire((v) => !v)}
        >
          <Flame className="h-3.5 w-3.5 mr-1.5" /> Sólo precio brutal
        </Button>
        <Button
          variant={maxPrice === 100 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMaxPrice(maxPrice === 100 ? undefined : 100)}
        >
          ≤ 100€
        </Button>
        <Button
          variant={maxPrice === 200 ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMaxPrice(maxPrice === 200 ? undefined : 200)}
        >
          ≤ 200€
        </Button>
      </div>

      {/* Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Feed
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {deals.length} {deals.length === 1 ? 'oferta' : 'ofertas'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </>
          )}

          {!isLoading && deals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Aún no hay ofertas. El bot las irá añadiendo aquí en cuanto encuentre alguna.
              </p>
            </div>
          )}

          {deals.map((deal) => {
            const score = SCORE_LABELS[deal.score];
            const isFresh = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
            const isSent = deal.message_status === 'sent';

            return (
              <div
                key={deal.id}
                className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                  isFresh
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border hover:bg-secondary/50'
                }`}
              >
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="w-16 h-16 rounded-lg object-cover bg-muted shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                    📱
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-semibold text-sm leading-tight line-clamp-2">{deal.title}</p>
                    <p className="font-bold text-base whitespace-nowrap">
                      {deal.price ? `${deal.price}€` : '—'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className={score.className + ' text-xs h-5'}>
                      {score.emoji} {score.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      hace {formatDistanceToNow(new Date(deal.created_at), { locale: es })}
                      {deal.location ? ` · ${deal.location}` : ''}
                    </span>
                  </div>

                  {deal.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {deal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {isSent ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        ✅ Contactado
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleContact(deal)}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Contactar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a href={deal.item_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Ver
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => archive.mutate(deal.id)}
                      title="Archivar"
                    >
                      <Archive className="h-3.5 w-3.5" />
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
