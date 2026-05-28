import { useState, useMemo, useCallback } from 'react';
import { Target, Flame, ExternalLink, Archive, Radio, Zap, MessageCircle, Bell, BellOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    label: 'BRUTAL',
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
  colBg: string;
  priority: number;
}

const SEARCH_CONFIG: Record<string, SearchConfig> = {
  'iphone pantalla rota': {
    label: 'Pantalla rota',
    emoji: '💥',
    description: 'Mayor beneficio · reparación',
    headerBg: 'bg-destructive/8',
    headerBorder: 'border-destructive/30',
    headerText: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/25',
    colBg: 'bg-destructive/3',
    priority: 1,
  },
  'iphone roto': {
    label: 'iPhone roto',
    emoji: '🔧',
    description: 'Piezas o reparación general',
    headerBg: 'bg-amber-500/8',
    headerBorder: 'border-amber-500/30',
    headerText: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    colBg: 'bg-amber-500/3',
    priority: 2,
  },
  'iphone chollo 30km': {
    label: 'Chollo 30km',
    emoji: '⚡',
    description: 'Funcional · cerca de ti',
    headerBg: 'bg-success/8',
    headerBorder: 'border-success/30',
    headerText: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/25',
    colBg: 'bg-success/3',
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
    colBg: 'bg-muted/10',
    priority: 99,
  };

// ─── Deal card ─────────────────────────────────────────────────────────────
function DealCard({ deal, onContact, onArchive, queuePending, showSourceBadge = false }: {
  deal: Deal;
  onContact: () => void;
  onArchive: () => void;
  queuePending: boolean;
  showSourceBadge?: boolean;
}) {
  const score = SCORE_CONFIG[deal.score];
  const searchCfg = getSearchConfig(deal.search_keyword);
  const isFresh = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
  const isSent = deal.message_status === 'sent';
  const isQueued = deal.message_status === 'queued' || deal.message_status === 'sending';
  const isFailed = deal.message_status === 'failed';
  const timeAgo = formatDistanceToNow(new Date(deal.created_at), { locale: es });
  const sentTime = deal.message_sent_at
    ? format(new Date(deal.message_sent_at), 'HH:mm')
    : null;

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border transition-all ${
        isFresh
          ? 'border-destructive/40 bg-destructive/5 shadow-sm'
          : 'border-border/60 bg-card hover:bg-secondary/30'
      }`}
    >
      {/* Imagen */}
      {deal.image_url ? (
        <img
          src={deal.image_url}
          alt={deal.title}
          className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-muted/60 flex items-center justify-center text-xl shrink-0">
          📱
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Título y precio */}
        <div className="flex justify-between items-start gap-1.5 mb-1">
          <p className="font-semibold text-sm leading-snug line-clamp-2">{deal.title}</p>
          <p className="font-bold text-base whitespace-nowrap leading-tight shrink-0">
            {deal.price != null ? `${deal.price}€` : '—'}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          <Badge variant="outline" className={`${score.className} text-[10px] h-5 px-1.5`}>
            🔥 {score.label}
          </Badge>
          {showSourceBadge && (
            <Badge variant="outline" className={`${searchCfg.badgeClass} text-[10px] h-5 px-1.5 font-semibold`}>
              {searchCfg.emoji} {searchCfg.label}
            </Badge>
          )}
          {isFresh && (
            <Badge className="text-[10px] h-5 px-1.5 bg-destructive text-white border-0 animate-pulse">
              NUEVO
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {timeAgo}{deal.location ? ` · ${deal.location}` : ''}
          </span>
        </div>

        {/* Descripción */}
        {deal.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
            {deal.description}
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap gap-1.5">
          {isSent ? (
            <>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 h-6 px-2 text-[10px]">
                ✅ Enviado{sentTime ? ` ${sentTime}` : ''}
              </Badge>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" asChild>
                <a href={deal.item_url} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-2.5 w-2.5 mr-1" /> Ver chat
                </a>
              </Button>
            </>
          ) : isQueued ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 h-6 px-2 text-[10px] animate-pulse">
              ⏳ Bot enviando...
            </Badge>
          ) : isFailed ? (
            <div className="w-full space-y-1.5">
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-semibold">El bot no pudo enviar el mensaje</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-2 bg-destructive hover:bg-destructive/90 text-white"
                  onClick={onContact}
                  disabled={queuePending}
                >
                  <RefreshCw className="h-2.5 w-2.5 mr-1" /> Reintentar
                </Button>
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" asChild>
                  <a href={deal.item_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-2.5 w-2.5 mr-1" /> Enviar manualmente
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-6 text-[10px] px-2 bg-primary hover:bg-primary/90"
              onClick={onContact}
              disabled={queuePending}
            >
              <Zap className="h-2.5 w-2.5 mr-1" /> Contactar
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" asChild>
            <a href={deal.item_url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-2.5 w-2.5 mr-1" /> Wallapop
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] px-1.5 text-muted-foreground"
            onClick={onArchive}
            title="Archivar"
          >
            <Archive className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban column ─────────────────────────────────────────────────────────
function KanbanColumn({ keyword, deals, onContact, onArchive, queuePending }: {
  keyword: string | null;
  deals: Deal[];
  onContact: (id: string) => void;
  onArchive: (id: string) => void;
  queuePending: boolean;
}) {
  const cfg = getSearchConfig(keyword);
  const fireCount = deals.filter(d => d.score === 'fire').length;
  const goodCount = deals.filter(d => d.score === 'good').length;

  return (
    <div className={`flex flex-col rounded-xl border ${cfg.headerBorder} overflow-hidden min-h-[200px]`}>
      {/* Column header */}
      <div className={`px-3.5 py-3 ${cfg.headerBg} border-b ${cfg.headerBorder}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{cfg.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-sm font-bold ${cfg.headerText}`}>{cfg.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                {deals.length}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.description}</p>
          </div>
        </div>
        {/* Mini stats */}
        {deals.length > 0 && (
          <div className="flex gap-2 mt-2">
            {fireCount > 0 && (
              <span className="text-[10px] text-destructive font-semibold">🔥 {fireCount} brutal{fireCount !== 1 ? 'es' : ''}</span>
            )}
            {goodCount > 0 && (
              <span className="text-[10px] text-amber-500 font-semibold">⭐ {goodCount} buen precio</span>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className={`flex-1 p-2 space-y-2 ${cfg.colBg}`}>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/50">
            <p className="text-xs">Sin anuncios aún</p>
          </div>
        ) : (
          deals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              onContact={() => onContact(deal.id)}
              onArchive={() => onArchive(deal.id)}
              queuePending={queuePending}
              showSourceBadge={false}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const OfertasLive = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [onlyFire, setOnlyFire] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [activeSource, setActiveSource] = useState<string | null | 'all'>('all');

  const onDealFailed = useCallback((deal: import('@/hooks/useDeals').Deal) => {
    toast({
      title: '❌ El bot no pudo enviar el mensaje',
      description: (
        <div className="space-y-1">
          <p className="text-xs">"{deal.title}"</p>
          <p className="text-xs text-muted-foreground">
            Comprueba que el bot esté logueado en Wallapop.{' '}
            <button
              className="underline font-semibold text-foreground"
              onClick={() => navigate('/bot')}
            >
              Ver Panel del Bot →
            </button>
          </p>
        </div>
      ),
      variant: 'destructive',
      duration: 8000,
    });
  }, [toast, navigate]);

  const onDealSent = useCallback((deal: import('@/hooks/useDeals').Deal) => {
    toast({
      title: '✅ Mensaje enviado',
      description: `El bot contactó al vendedor de "${deal.title}"`,
      duration: 5000,
    });
  }, [toast]);

  const { deals, isLoading, archive, queueSend } = useDeals(
    { onlyFire, maxPrice },
    { onDealFailed, onDealSent }
  );
  const { supported, needsInstall, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const handleContact = (id: string) => {
    queueSend.mutate(id, {
      onSuccess: () =>
        toast({
          title: '⚡ Solicitud enviada al bot',
          description: 'El bot enviará el mensaje en los próximos 15 segundos.',
        }),
    });
  };

  // All unique search keywords sorted by priority
  const sources = useMemo(() => {
    const set = new Set(deals.map(d => d.search_keyword ?? null));
    return Array.from(set).sort((a, b) => getSearchConfig(a).priority - getSearchConfig(b).priority);
  }, [deals]);

  // Group deals by search_keyword
  const grouped = useMemo(() => {
    // Use canonical order from SEARCH_CONFIG so empty columns still show
    const keys = Object.keys(SEARCH_CONFIG) as (string | null)[];
    // Add any extra keys from data not in config
    sources.forEach(s => { if (s && !keys.includes(s)) keys.push(s); });

    return keys.map(keyword => {
      const filtered = deals.filter(d => {
        const match = (d.search_keyword ?? null) === keyword;
        if (activeSource !== 'all') return match && (d.search_keyword ?? null) === activeSource;
        return match;
      });
      return [keyword, filtered] as [string | null, Deal[]];
    });
  }, [deals, activeSource, sources]);

  // For mobile single-column view
  const mobileDeals = useMemo(() => {
    if (activeSource === 'all') return deals;
    return deals.filter(d => (d.search_keyword ?? null) === activeSource);
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
        {needsInstall ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 max-w-[220px]">
            <Bell className="h-3.5 w-3.5 shrink-0" />
            <span>Añade la app al inicio para activar notificaciones</span>
          </div>
        ) : supported ? (
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
        ) : null}
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

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* ── DESKTOP: Kanban 3 columnas ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Desktop kanban */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {grouped.map(([keyword, groupDeals]) => (
              <KanbanColumn
                key={keyword ?? 'otros'}
                keyword={keyword}
                deals={groupDeals}
                onContact={handleContact}
                onArchive={id => archive.mutate(id)}
                queuePending={queueSend.isPending}
              />
            ))}
          </div>

          {/* Mobile: tabs + single feed */}
          <div className="lg:hidden space-y-3">
            {/* Tab pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveSource('all')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeSource === 'all'
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas ({deals.length})
              </button>
              {Object.entries(SEARCH_CONFIG).map(([key, cfg]) => {
                const count = deals.filter(d => d.search_keyword === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSource(key)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      activeSource === key
                        ? `${cfg.badgeClass}`
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cfg.emoji} {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Feed */}
            {mobileDeals.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Aún no hay ofertas</p>
                <p className="text-xs mt-1 opacity-70">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mobileDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onContact={() => handleContact(deal.id)}
                    onArchive={() => archive.mutate(deal.id)}
                    queuePending={queueSend.isPending}
                    showSourceBadge={activeSource === 'all'}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state desktop */}
      {!isLoading && deals.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Aún no hay ofertas</p>
          <p className="text-xs mt-1 opacity-70">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
        </div>
      )}
    </div>
  );
};

export default OfertasLive;
