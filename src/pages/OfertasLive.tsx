import { useState, useMemo, useCallback } from 'react';
import {
  Target, Flame, ExternalLink, Archive, Radio, Zap, MessageCircle,
  Bell, BellOff, RefreshCw, AlertTriangle, MapPin, Clock, ChevronRight,
  MessageSquare, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDeals, Deal } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// ─── Score config ──────────────────────────────────────────────────────────
const SCORE_CONFIG: Record<Deal['score'], { label: string; emoji: string; className: string; dot: string }> = {
  fire: {
    label: 'BRUTAL',
    emoji: '🔥',
    className: 'bg-destructive/15 text-destructive border-destructive/30 font-bold',
    dot: 'bg-destructive',
  },
  good: {
    label: 'BUEN PRECIO',
    emoji: '⭐',
    className: 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold',
    dot: 'bg-amber-500',
  },
  ok: {
    label: 'OK',
    emoji: '✓',
    className: 'bg-primary/10 text-primary border-primary/20 font-bold',
    dot: 'bg-primary',
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
  accentColor: string;
  priority: number;
}

const SEARCH_CONFIG: Record<string, SearchConfig> = {
  'iphone pantalla rota': {
    label: 'Pantalla rota',
    emoji: '💥',
    description: 'Mayor beneficio · reparación',
    headerBg: 'bg-destructive/6',
    headerBorder: 'border-destructive/25',
    headerText: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/25',
    colBg: 'bg-destructive/[0.025]',
    accentColor: 'hsl(0 72% 51%)',
    priority: 1,
  },
  'iphone roto': {
    label: 'iPhone roto',
    emoji: '🔧',
    description: 'Piezas o reparación general',
    headerBg: 'bg-amber-500/6',
    headerBorder: 'border-amber-500/25',
    headerText: 'text-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    colBg: 'bg-amber-500/[0.025]',
    accentColor: 'hsl(38 92% 50%)',
    priority: 2,
  },
  'iphone chollo 30km': {
    label: 'Chollo 30km',
    emoji: '⚡',
    description: 'Funcional · cerca de ti',
    headerBg: 'bg-success/6',
    headerBorder: 'border-success/25',
    headerText: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/25',
    colBg: 'bg-success/[0.025]',
    accentColor: 'hsl(160 84% 38%)',
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
    accentColor: 'hsl(var(--muted-foreground))',
    priority: 99,
  };

// ─── Deal actions ──────────────────────────────────────────────────────────
function DealActions({ deal, onContact, onArchive, queuePending, size = 'sm' }: {
  deal: Deal;
  onContact: () => void;
  onArchive: () => void;
  queuePending: boolean;
  size?: 'sm' | 'lg';
}) {
  const isSent    = deal.message_status === 'sent';
  const isQueued  = deal.message_status === 'queued' || deal.message_status === 'sending';
  const isFailed  = deal.message_status === 'failed';
  const sentTime  = deal.message_sent_at ? format(new Date(deal.message_sent_at), 'HH:mm') : null;
  const isLg      = size === 'lg';
  const h         = isLg ? 'h-9'    : 'h-7';
  const txt       = isLg ? 'text-xs' : 'text-[11px]';
  const px        = isLg ? 'px-4'   : 'px-3';
  const iconCls   = isLg ? 'h-3.5 w-3.5' : 'h-3 w-3';

  return (
    <div className="flex flex-wrap gap-1.5">
      {isSent ? (
        <>
          <div className={`flex items-center gap-1.5 ${h} ${px} rounded-lg bg-success/12 border border-success/25 ${txt} font-semibold text-success`}>
            <CheckCircle2 className={iconCls} />
            Enviado{sentTime ? ` · ${sentTime}` : ''}
          </div>
          <Button size="sm" variant="outline" className={`${h} ${txt} ${px} rounded-lg`} asChild>
            <a href={deal.item_url} target="_blank" rel="noreferrer">
              <MessageCircle className={`${iconCls} mr-1`} /> Ver chat
            </a>
          </Button>
        </>
      ) : isQueued ? (
        <div className={`flex items-center gap-1.5 ${h} ${px} rounded-lg bg-amber-500/12 border border-amber-500/25 ${txt} font-semibold text-amber-500 animate-pulse`}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Bot enviando…
        </div>
      ) : isFailed ? (
        <>
          <div className="w-full flex items-center gap-1.5 text-destructive mb-0.5">
            <AlertTriangle className={iconCls} />
            <span className={`${txt} font-semibold`}>El bot no pudo enviar</span>
          </div>
          <button
            className={`btn-primary-gradient flex items-center gap-1.5 ${h} ${px} rounded-lg ${txt} font-semibold text-white`}
            onClick={onContact} disabled={queuePending}
            style={{ background: 'hsl(0 72% 51%)' }}
          >
            <RefreshCw className={iconCls} /> Reintentar
          </button>
          <Button size="sm" variant="outline" className={`${h} ${txt} ${px} rounded-lg`} asChild>
            <a href={deal.item_url} target="_blank" rel="noreferrer">
              <ExternalLink className={`${iconCls} mr-1`} /> Manual
            </a>
          </Button>
        </>
      ) : (
        <button
          className={`btn-primary-gradient flex items-center gap-1.5 ${h} ${px} rounded-lg ${txt} font-bold text-white`}
          onClick={onContact}
          disabled={queuePending}
        >
          <Zap className={iconCls} fill="white" strokeWidth={0} />
          Contactar
        </button>
      )}

      <Button size="sm" variant="outline" className={`${h} ${txt} ${px} rounded-lg`} asChild>
        <a href={deal.item_url} target="_blank" rel="noreferrer">
          <ExternalLink className={`${iconCls} mr-1`} /> Wallapop
        </a>
      </Button>
      <button
        className={`flex items-center justify-center ${h} w-8 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-colors`}
        onClick={onArchive}
        title="Archivar"
      >
        <Archive className={iconCls} />
      </button>
    </div>
  );
}

// ─── Deal detail sheet ──────────────────────────────────────────────────────
function DealDetailSheet({ deal, open, onClose, onContact, onArchive, queuePending }: {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onContact: () => void;
  onArchive: () => void;
  queuePending: boolean;
}) {
  if (!deal) return null;
  const score     = SCORE_CONFIG[deal.score];
  const searchCfg = getSearchConfig(deal.search_keyword);
  const isFresh   = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
  const timeAgo   = formatDistanceToNow(new Date(deal.created_at), { locale: es, addSuffix: true });

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92dvh] overflow-y-auto p-0">
        {/* Hero image */}
        {deal.image_url ? (
          <div className="w-full bg-muted/20 overflow-hidden" style={{ maxHeight: '52vw' }}>
            <img
              src={deal.image_url}
              alt={deal.title}
              className="w-full object-cover"
              style={{ maxHeight: '52vw' }}
            />
          </div>
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center text-6xl">📱</div>
        )}

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* Title + price */}
          <div className="flex justify-between items-start gap-3">
            <SheetTitle className="text-lg font-bold leading-snug flex-1">{deal.title}</SheetTitle>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-primary tabular-nums">
                {deal.price != null ? `${deal.price}€` : '—'}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={`${score.className} text-xs h-6 px-2.5 rounded-lg`}>
              {score.emoji} {score.label}
            </Badge>
            <Badge variant="outline" className={`${searchCfg.badgeClass} text-xs h-6 px-2.5 font-semibold rounded-lg`}>
              {searchCfg.emoji} {searchCfg.label}
            </Badge>
            {isFresh && (
              <Badge className="text-xs h-6 px-2.5 bg-destructive text-white border-0 animate-pulse rounded-lg">
                NUEVO
              </Badge>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{timeAgo}</span>
            {deal.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{deal.location}</span>}
          </div>

          <Separator />

          {deal.description ? (
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Descripción</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{deal.description}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin descripción</p>
          )}

          <Separator />

          <DealActions
            deal={deal}
            onContact={() => { onContact(); onClose(); }}
            onArchive={() => { onArchive(); onClose(); }}
            queuePending={queuePending}
            size="lg"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Deal card ─────────────────────────────────────────────────────────────
function DealCard({ deal, onContact, onArchive, queuePending, showSourceBadge = false, onOpen }: {
  deal: Deal;
  onContact: () => void;
  onArchive: () => void;
  queuePending: boolean;
  showSourceBadge?: boolean;
  onOpen: () => void;
}) {
  const score     = SCORE_CONFIG[deal.score];
  const searchCfg = getSearchConfig(deal.search_keyword);
  const isFresh   = Date.now() - new Date(deal.created_at).getTime() < 5 * 60 * 1000;
  const timeAgo   = formatDistanceToNow(new Date(deal.created_at), { locale: es });

  return (
    <div
      className={`deal-card ${isFresh ? 'deal-card-fire' : ''} animate-deal-pop`}
      onClick={onOpen}
    >
      {/* Image strip on left for fresh/scored items */}
      <div className="flex gap-0 overflow-hidden">
        {/* Score accent bar */}
        <div className="w-[3px] shrink-0 rounded-l-xl self-stretch" style={{ background: searchCfg.accentColor }} />

        <div className="flex gap-3 p-3 flex-1">
          {/* Image */}
          {deal.image_url ? (
            <div className="shrink-0">
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-16 h-16 rounded-xl object-cover bg-muted"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-2xl shrink-0">📱</div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title + price row */}
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <p className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{deal.title}</p>
              <div className="flex items-center gap-1 shrink-0">
                <p className="font-bold text-base tabular-nums leading-tight text-foreground">
                  {deal.price != null ? `${deal.price}€` : '—'}
                </p>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
            </div>

            {/* Score + source + fresh */}
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${score.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${score.dot}`} />
                {score.label}
              </span>
              {showSourceBadge && (
                <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${searchCfg.badgeClass}`}>
                  {searchCfg.emoji} {searchCfg.label}
                </span>
              )}
              {isFresh && (
                <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-destructive text-white animate-pulse">
                  NUEVO
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60 ml-auto">
                {timeAgo}{deal.location ? ` · ${deal.location}` : ''}
              </span>
            </div>

            {/* Preview description */}
            {deal.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2 leading-snug">{deal.description}</p>
            )}

            {/* Actions */}
            <div onClick={e => e.stopPropagation()}>
              <DealActions deal={deal} onContact={onContact} onArchive={onArchive} queuePending={queuePending} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban column ─────────────────────────────────────────────────────────
function KanbanColumn({ keyword, deals, onContact, onArchive, queuePending, onOpenDetail }: {
  keyword: string | null;
  deals: Deal[];
  onContact: (id: string) => void;
  onArchive: (id: string) => void;
  queuePending: boolean;
  onOpenDetail: (deal: Deal) => void;
}) {
  const cfg       = getSearchConfig(keyword);
  const fireCount = deals.filter(d => d.score === 'fire').length;
  const goodCount = deals.filter(d => d.score === 'good').length;

  return (
    <div className={`flex flex-col rounded-2xl border ${cfg.headerBorder} overflow-hidden min-h-[200px] animate-slide-up`}>
      {/* Accent top bar */}
      <div className="h-[3px]" style={{ background: cfg.accentColor }} />

      {/* Column header */}
      <div className={`px-4 py-3.5 ${cfg.headerBg} border-b ${cfg.headerBorder}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none">{cfg.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${cfg.headerText}`}>{cfg.label}</span>
                <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                  {deals.length}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
            </div>
          </div>
        </div>
        {deals.length > 0 && (
          <div className="flex gap-3 mt-2.5">
            {fireCount > 0 && (
              <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                🔥 {fireCount} brutal{fireCount !== 1 ? 'es' : ''}
              </span>
            )}
            {goodCount > 0 && (
              <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                ⭐ {goodCount} buen precio
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className={`flex-1 p-2.5 space-y-2 ${cfg.colBg}`}>
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
            <span className="text-3xl mb-2 opacity-30">{cfg.emoji}</span>
            <p className="text-xs font-medium">Sin anuncios aún</p>
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
              onOpen={() => onOpenDetail(deal)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── KPI mini card ─────────────────────────────────────────────────────────
function MiniKPI({ emoji, label, value, sub, accentColor }: {
  emoji: string; label: string; value: string | number; sub: string; accentColor?: string;
}) {
  return (
    <div className="kpi-card flex-1 min-w-[120px] cursor-default">
      <div className="h-[2px] w-full rounded-t-xl" style={{ background: accentColor ?? 'hsl(var(--primary))' }} />
      <div className="p-3 sm:p-4">
        <div className="text-lg mb-0.5">{emoji}</div>
        <p className="stat-number text-xl sm:text-2xl" style={{ color: accentColor ?? 'hsl(var(--primary))' }}>
          {value}
        </p>
        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Filter pill ───────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-semibold transition-all duration-150 border ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]'
          : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border bg-card'
      }`}
    >
      {children}
    </button>
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
            <button className="underline font-semibold text-foreground" onClick={() => navigate('/bot')}>
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

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const { deals, isLoading, archive, queueSend, realStats } = useDeals(
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

  const sources = useMemo(() => {
    const set = new Set(deals.map(d => d.search_keyword ?? null));
    return Array.from(set).sort((a, b) => getSearchConfig(a).priority - getSearchConfig(b).priority);
  }, [deals]);

  const grouped = useMemo(() => {
    const keys = Object.keys(SEARCH_CONFIG) as (string | null)[];
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

  const mobileDeals = useMemo(() => {
    if (activeSource === 'all') return deals;
    return deals.filter(d => (d.search_keyword ?? null) === activeSource);
  }, [deals, activeSource]);

  // Use real DB counts (not capped by display limit)
  const stats = {
    today:        realStats.todayTotal,
    sent:         realStats.sentTotal,
    pending:      realStats.pendingTotal,
    pantallaRota: deals.filter(d => d.search_keyword === 'iphone pantalla rota').length,
    fire:         realStats.fireTodayTotal,
  };

  const notifAction = needsInstall ? (
    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-600 dark:text-amber-400 max-w-[220px]">
      <Bell className="h-3.5 w-3.5 shrink-0" />
      <span>Añade la app al inicio para notificaciones</span>
    </div>
  ) : supported ? (
    <button
      className={`flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all border ${
        isSubscribed
          ? 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/15'
          : 'btn-primary-gradient text-white border-transparent'
      }`}
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={pushLoading}
    >
      {isSubscribed
        ? <><BellOff className="h-4 w-4" /> Notif. ON</>
        : <><Bell className="h-4 w-4" /> Activar notif. 🔥</>
      }
    </button>
  ) : null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* ── Header ── */}
      <PageHeader
        icon={Target}
        title="En directo"
        iconColor="red"
        subtitle="El bot encuentra ofertas y aparecen aquí en tiempo real"
        badge={
          <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px] font-bold px-2 gap-1">
            <Radio className="h-2.5 w-2.5 animate-pulse" /> EN DIRECTO
          </Badge>
        }
        actions={notifAction ?? undefined}
      />

      {/* ── KPIs ── */}
      <div className="flex flex-wrap gap-3">
        <MiniKPI
          emoji="📡"
          label="Hoy"
          value={stats.today}
          sub="ofertas encontradas hoy"
          accentColor="hsl(0 72% 51%)"
        />
        <MiniKPI
          emoji="🔥"
          label="En fuego hoy"
          value={stats.fire}
          sub="puntuación brutal"
          accentColor="hsl(0 72% 51%)"
        />
        <MiniKPI
          emoji="💬"
          label="Mensajes"
          value={stats.sent}
          sub={`enviados · ${stats.pending} pendientes`}
          accentColor="hsl(262 73% 58%)"
        />
        <MiniKPI
          emoji="🤖"
          label="Bot"
          value="Activo"
          sub="escanea cada 2 min"
          accentColor="hsl(160 84% 38%)"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={onlyFire} onClick={() => setOnlyFire(v => !v)}>
          <Flame className="h-3 w-3" /> Solo fuego
        </FilterPill>
        <FilterPill active={maxPrice === 100} onClick={() => setMaxPrice(maxPrice === 100 ? undefined : 100)}>
          ≤ 100€
        </FilterPill>
        <FilterPill active={maxPrice === 200} onClick={() => setMaxPrice(maxPrice === 200 ? undefined : 200)}>
          ≤ 200€
        </FilterPill>
        {(onlyFire || maxPrice) && (
          <button
            className="h-8 px-3 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setOnlyFire(false); setMaxPrice(undefined); }}
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/50 animate-slide-up">
              <div className="h-[3px] skeleton-shimmer" />
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(j => <Skeleton key={j} className="h-20 rounded-xl" />)}
              </div>
            </div>
          ))}
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
                onOpenDetail={setSelectedDeal}
              />
            ))}
          </div>

          {/* Mobile: tabs + feed */}
          <div className="lg:hidden space-y-3">
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              <FilterPill active={activeSource === 'all'} onClick={() => setActiveSource('all')}>
                Todas ({deals.length})
              </FilterPill>
              {Object.entries(SEARCH_CONFIG).map(([key, cfg]) => {
                const count = deals.filter(d => d.search_keyword === key).length;
                return (
                  <FilterPill key={key} active={activeSource === key} onClick={() => setActiveSource(key)}>
                    {cfg.emoji} {cfg.label} ({count})
                  </FilterPill>
                );
              })}
            </div>

            {mobileDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Target className="h-12 w-12 mb-3 opacity-15" />
                <p className="text-sm font-semibold">Aún no hay ofertas</p>
                <p className="text-xs mt-1 opacity-60">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
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
                    onOpen={() => setSelectedDeal(deal)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state desktop */}
      {!isLoading && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 opacity-20"
            style={{ background: 'hsl(0 72% 51% / 0.15)' }}
          >
            <Target className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm font-semibold">Aún no hay ofertas</p>
          <p className="text-xs mt-1 opacity-60">El bot las irá añadiendo aquí en cuanto encuentre alguna.</p>
        </div>
      )}

      {/* Detail sheet */}
      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onContact={() => selectedDeal && handleContact(selectedDeal.id)}
        onArchive={() => selectedDeal && archive.mutate(selectedDeal.id)}
        queuePending={queueSend.isPending}
      />
    </div>
  );
};

export default OfertasLive;
