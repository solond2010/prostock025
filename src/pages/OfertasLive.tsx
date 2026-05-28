import { useState, useMemo } from 'react';
import { Target, Flame, ExternalLink, Archive, Radio, Zap, MessageCircle, Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, Deal } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// ─── Score config ──────────────────────────────────────────────────────────
const SCORE_CONFIG: Record<Deal['score'], { label: string; className: string }> = {
  fire: {
    label: 'PRECIO BRUTAL',
    className: 'bg-destructive/15 text-destructive border-destructive/30 font-bold',
  },
  good: {
    label: 'BUEN PRECIO',
    className: 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold',
  },
  ok: {
    label: 'OK',
    className: 'bg-primary/10 text-primary border-primary/20 font-bold',
  },
};

// ─── Search source config ──────────────────────────────────────────────────
interface SearchConfig {
  label: string;
  emoji: string;
  description: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  badgeClass: string;
  priority: number;
}

const SEARCH_CONFIG: Record<string, SearchConfig> = {
  'iphone pantalla rota': {
    label: 'Pantalla rota',
    emoji: '💥',
    description: 'Mayor beneficio estimado · reparación de pantalla',
    headerBg: 'bg-destructive/5',
    headerBorder: 'border-destructive/25',
    headerText: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/25',
    priority: 1,
  },
  'iphone roto': {
    label: 'iPhone roto',
    emoji: '🔧',
    description: 'Para piezas o reparación general',
    headerBg: 'bg-amber-500/5',
    headerBorder: 'border-amber-500/25',
    headerText: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    priority: 2,
  },
  'iphone chollo 30km': {
    label: 'Chollo 30km',
    emoji: '⚡',
    description: 'Funcional · sin reparar · cerca de ti',
    headerBg: 'bg-success/5',
    headerBorder: 'border-success/25',
    headerText: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/25',
    priority: 3,
  },
};

const getSearchConfig = (keyword: string | null): SearchConfig =>
  (keyword && SEARCH_CONFIG[keyword]) ? SEARCH_CONFIG[keyword] : {
    label: keyword ?? 'Otros',
    emoji: '📦',
    description: 'Otras búsquedas',
    headerBg: 'bg-muted/30',
    headerBorder: 'border-border/40',
    headerText: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border/40',
    priority: 99,
  };

// ─── Deal card ─────────────────────────────────────────────────────────────
function DealCard({ deal, onContact, onArchive, queuePending }: {
  deal: Deal;
  onContact: () => void;
  onArchive: () => void;
  queuePending: boolean;
}) {
  const score = SCORE_CONFIG[deal.score];
  const searchCfg = getSearchConfig(deal.search_keyword);
  const isFresh = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
  const isSent = deal.message_status === 'sent';
  const isQueued = deal.message_status === 'queued' || deal.message_status === 'sending';
  const timeAgo = formatDistanceToNow(new Date(deal.created_at), { locale: es });
  const sentTime = deal.message_sent_at
    ? format(new Date(deal.message_sent_at), 'HH:mm')
    : null;

  return (
    <div
      className={`flex gap-3 p-3.5 rounded-xl border transition-all ${
        isFresh
          ? 'border-destructive/40 bg-destructive/5 shadow-sm'
          : 'border-border/60 hover:bg-secondary/40'
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

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <Badge variant="outline" className={`${score.className} text-[10px] h-5 px-2`}>
            🔥 {score.label}
          </Badge>
          <Badge variant="outline" className={`${searchCfg.badgeClass} text-[10px] h-5 px-2 font-semibold`}>
            {searchCfg.emoji} {searchCfg.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            hace {timeAgo}
            {deal.location ? ` · ${deal.location}` : ''}
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
          ) : isQueued ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 h-7 px-3 text-xs animate-pulse">
              ⏳ Bot enviando mensaje...
            </Badge>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90"
              onClick={onContact}
              disabled={queuePending}
            >
              <Zap className="h-3 w-3 mr-1" /> Contactar ahora
            </Button>
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
            onClick={onArchive}
            title="Archivar"
          >
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Search group section ──────────────────────────────────────────────────
function SearchGroup({ keyword, deals, onContact, onArchive, queuePending, defaultOpen = true }: {
  keyword: string | null;
  deals: Deal[];
  onContact: (id: string) => void;
  onArchive: (id: string) => void;
  queuePending: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = getSearchConfig(keyword);
  const fireCount = deals.filter(d => d.score === 'fire').length;
  const goodCount = deals.filter(d => d.score === 'good').length;

  return (
    <div className={`rounded-xl border ${cfg.headerBorder} overflow-hidden`}>
      {/* Header colapsable */}
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 ${cfg.headerBg} text-left transition-opacity hover:opacity-90`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xl leading-none">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`text-sm font-bold ${cfg.headerText}`}>{cfg.label}</span>
            {cfg.description && (
              <span className="text-xs text-muted-foreground hidden sm:inline">· {cfg.description}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">{deals.length} anuncio{deals.length !== 1 ? 's' : ''}</span>
            {fireCount > 0 && (
              <span className="text-[11px] text-destructive font-semibold">🔥 {fireCount} brutal{fireCount !== 1 ? 'es' : ''}</span>
            )}
            {goodCount > 0 && (
              <span className="text-[11px] text-amber-500 font-semibold">⭐ {goodCount} buen precio</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Lista de deals */}
      {open && (
        <div className="space-y-2 p-2 bg-card">
          {deals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              onContact={() => onContact(deal.id)}
              onArchive={() => onArchive(deal.id)}
              queuePending={queuePending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const OfertasLive = () => {
  const { toast } = useToast();
  const [onlyFire, setOnlyFire] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [activeSource, setActiveSource] = useState<string | null | 'all'>('all');

  const { deals, isLoading, archive, queueSend } = useDeals({ onlyFire, maxPrice });
  const { supported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const handleContact = (id: string) => {
    queueSend.mutate(id, {
      onSuccess: () =>
        toast({
          title: '⚡ Enviando mensaje...',
          description: 'El bot lo enviará en Wallapop en los próximos segundos.',
        }),
    });
  };

  // All unique search keywords present in data
  const sources = useMemo(() => {
    const set = new Set(deals.map(d => d.search_keyword ?? null));
    return Array.from(set).sort((a, b) => getSearchConfig(a).priority - getSearchConfig(b).priority);
  }, [deals]);

  // Group deals by search_keyword, filtered by activeSource
  const grouped = useMemo(() => {
    const filtered = activeSource !== 'all'
      ? deals.filter(d => (d.search_keyword ?? null) === activeSource)
      : deals;

    const map = new Map<string | null, Deal[]>();
    filtered.forEach(deal => {
      const key = deal.search_keyword ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(deal);
    });

    return Array.from(map.entries()).sort(([ka], [kb]) =>
      getSearchConfig(ka).priority - getSearchConfig(kb).priority
    );
  }, [deals, activeSource]);

  const stats = {
    today: deals.filter(d => Date.now() - new Date(d.created_at).getTime() < 24 * 60 * 60 * 1000).length,
    sent: deals.filter(d => d.message_status === 'sent').length,
    pending: deals.filter(d => d.message_status === 'pending').length,
    pantallaRota: deals.filter(d => d.search_keyword === 'iphone pantalla rota').length,
  };

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
        {supported && (
          <Button
            variant={isSubscribed ? 'default' : 'outline'}
            size="sm"
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={pushLoading}
            className="shrink-0"
          >
            {isSubscribed
              ? <><BellOff className="h-3.5 w-3.5 mr-1.5" /> Notificaciones ON</>
              : <><Bell className="h-3.5 w-3.5 mr-1.5" /> Activar notificaciones 🔥</>
            }
          </Button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">🔥 Hoy</div>
            <div className="text-2xl font-bold">{stats.today}</div>
            <div className="text-xs text-muted-foreground mt-0.5">ofertas nuevas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">💬 Mensajes</div>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <div className="text-xs text-muted-foreground mt-0.5">enviados · {stats.pending} pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">💥 Pantalla rota</div>
            <div className="text-2xl font-bold">{stats.pantallaRota}</div>
            <div className="text-xs text-muted-foreground mt-0.5">anuncios encontrados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">🤖 Bot</div>
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

            {/* Filtros precio/score */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={onlyFire ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOnlyFire(v => !v)}
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

          {/* Tabs de búsqueda — solo si hay más de 1 fuente */}
          {sources.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2.5 border-t border-border/50">
              <button
                onClick={() => setActiveSource('all')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  activeSource === 'all'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
                }`}
              >
                Todas ({deals.length})
              </button>
              {sources.map(src => {
                const cfg = getSearchConfig(src);
                const count = deals.filter(d => (d.search_keyword ?? null) === src).length;
                return (
                  <button
                    key={src ?? 'otros'}
                    onClick={() => setActiveSource(src)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      activeSource === src
                        ? `${cfg.badgeClass}`
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {cfg.emoji} {cfg.label} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {isLoading && (
            <>{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</>
          )}

          {!isLoading && deals.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Aún no hay ofertas</p>
              <p className="text-xs mt-1 opacity-70">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
            </div>
          )}

          {/* Secciones agrupadas por búsqueda */}
          {!isLoading && grouped.map(([keyword, groupDeals], idx) => (
            <SearchGroup
              key={keyword ?? 'otros'}
              keyword={keyword}
              deals={groupDeals}
              onContact={handleContact}
              onArchive={id => archive.mutate(id)}
              queuePending={queueSend.isPending}
              defaultOpen={idx === 0}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfertasLive;
