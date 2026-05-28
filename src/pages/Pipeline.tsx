import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GitCommitHorizontal, ChevronRight, ChevronLeft, ExternalLink,
  Archive, ShoppingCart, Wrench, TrendingUp, Package, Sparkles,
  Clock, MapPin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeals, Deal, PipelineStatus } from '@/hooks/useDeals';
import { useCreateStockItem } from '@/hooks/useStockItems';
import { useToast } from '@/hooks/use-toast';

// ─── Pipeline stage config ─────────────────────────────────────────────────
interface StageConfig {
  label: string;
  emoji: string;
  description: string;
  color: string;         // text color class
  bg: string;            // header bg
  border: string;        // border color
  badgeCls: string;
  colBg: string;
}

export const PIPELINE_STAGES: Record<PipelineStatus, StageConfig> = {
  found: {
    label: 'Encontrado',
    emoji: '🎯',
    description: 'Bot encontró el anuncio',
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border/40',
    badgeCls: 'bg-muted text-muted-foreground border-border/40',
    colBg: 'bg-muted/10',
  },
  contacted: {
    label: 'Contactado',
    emoji: '💬',
    description: 'Mensaje enviado al vendedor',
    color: 'text-blue-500',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/30',
    badgeCls: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
    colBg: 'bg-blue-500/3',
  },
  responded: {
    label: 'Respondió',
    emoji: '🔔',
    description: 'Vendedor contestó',
    color: 'text-amber-500',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/30',
    badgeCls: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    colBg: 'bg-amber-500/3',
  },
  bought: {
    label: 'Comprado',
    emoji: '🛒',
    description: 'Adquirido · en tu poder',
    color: 'text-success',
    bg: 'bg-success/8',
    border: 'border-success/30',
    badgeCls: 'bg-success/10 text-success border-success/25',
    colBg: 'bg-success/3',
  },
  repairing: {
    label: 'Reparando',
    emoji: '🔧',
    description: 'En proceso de reparación',
    color: 'text-orange-500',
    bg: 'bg-orange-500/8',
    border: 'border-orange-500/30',
    badgeCls: 'bg-orange-500/10 text-orange-500 border-orange-500/25',
    colBg: 'bg-orange-500/3',
  },
  sold: {
    label: 'Vendido',
    emoji: '✅',
    description: 'Cerrado · beneficio realizado',
    color: 'text-purple-500',
    bg: 'bg-purple-500/8',
    border: 'border-purple-500/30',
    badgeCls: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
    colBg: 'bg-purple-500/3',
  },
};

const STAGE_ORDER: PipelineStatus[] = ['found', 'contacted', 'responded', 'bought', 'repairing', 'sold'];

function getPipelineStatus(deal: Deal): PipelineStatus {
  return deal.pipeline_status ?? 'found';
}

// ─── Quick buy dialog ───────────────────────────────────────────────────────
const buySchema = z.object({
  name: z.string().min(1),
  purchase_price: z.coerce.number().min(0),
  repair_cost: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  storage: z.string().optional(),
});

type BuyForm = z.infer<typeof buySchema>;

function QuickBuySheet({
  deal,
  open,
  onClose,
  onDone,
}: {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const createStock = useCreateStockItem();
  const { toast } = useToast();

  const form = useForm<BuyForm>({
    resolver: zodResolver(buySchema),
    values: {
      name: deal?.title?.slice(0, 100) ?? '',
      purchase_price: deal?.price ?? 0,
      repair_cost: 0,
      sale_price: deal ? Math.round((deal.price ?? 0) * 1.6) : 0,
      storage: '',
    },
  });

  const watchPurchase = form.watch('purchase_price');
  const watchRepair = form.watch('repair_cost');
  const watchSale = form.watch('sale_price');
  const totalCost = Number(watchPurchase || 0) + Number(watchRepair || 0);
  const profit = Number(watchSale || 0) - totalCost;
  const margin = watchSale > 0 ? (profit / watchSale) * 100 : 0;

  const handleSubmit = async (data: BuyForm) => {
    try {
      await createStock.mutateAsync({
        name: data.name,
        category: 'Telefonía',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price_per_unit: data.purchase_price,
        sale_price_per_unit: data.sale_price,
        notes: deal?.item_url ? `Wallapop: ${deal.item_url}` : '',
        estado: 'En stock',
        precio_envio: 0,
        coste_reparacion: data.repair_cost,
        fecha_venta: '',
        precio_venta_real: 0,
        almacenamiento: data.storage || null,
        bateria_porcentaje: null,
        reparaciones: [],
        color: '',
        talla: '',
      } as any);
      toast({ title: '🛒 Añadido al stock', description: `"${data.name}" ya aparece en el Gestor de Stock` });
      onDone();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh] overflow-y-auto p-0">
        <div className="p-5 space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-success">
              <ShoppingCart className="h-5 w-5" />
              Confirmar compra
            </SheetTitle>
          </SheetHeader>
          <p className="text-xs text-muted-foreground -mt-1">Se añadirá al Gestor de Stock. Puedes editar los detalles después.</p>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nombre del dispositivo</Label>
              <Input {...form.register('name')} className="h-9 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Precio pagado (€)</Label>
                <Input type="number" min="0" step="0.01" {...form.register('purchase_price')} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Coste reparación (€)</Label>
                <Input type="number" min="0" step="0.01" {...form.register('repair_cost')} className="h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Precio venta esperado (€)</Label>
                <Input type="number" min="0" step="0.01" {...form.register('sale_price')} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Almacenamiento</Label>
                <Input placeholder="128GB…" {...form.register('storage')} className="h-9 text-sm" />
              </div>
            </div>

            {/* Mini profit preview */}
            <div className={`rounded-xl border p-3 ${profit >= 0 ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Coste total</p>
                  <p className="text-base font-bold">{totalCost.toFixed(0)}€</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Beneficio esp.</p>
                  <p className={`text-base font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(0)}€
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Margen</p>
                  <p className={`text-base font-bold flex items-center justify-center gap-0.5 ${margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                    <TrendingUp className="h-3 w-3" />{margin.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 h-10" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 h-10 bg-success hover:bg-success/90 text-white" disabled={createStock.isPending}>
                {createStock.isPending ? 'Guardando...' : '🛒 Añadir al stock'}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Pipeline deal card ────────────────────────────────────────────────────
function PipelineCard({
  deal,
  onMoveBack,
  onMoveForward,
  onArchive,
  isPending,
}: {
  deal: Deal;
  onMoveBack: () => void;
  onMoveForward: () => void;
  onArchive: () => void;
  isPending: boolean;
}) {
  const stage = getPipelineStatus(deal);
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const canGoBack = stageIdx > 0;
  const canGoForward = stageIdx < STAGE_ORDER.length - 1;
  const nextStage = canGoForward ? PIPELINE_STAGES[STAGE_ORDER[stageIdx + 1]] : null;
  const timeAgo = formatDistanceToNow(new Date(deal.created_at), { locale: es });
  const scoreColor = deal.score === 'fire' ? 'text-destructive' : deal.score === 'good' ? 'text-amber-500' : 'text-muted-foreground';
  const scoreEmoji = deal.score === 'fire' ? '🔥' : deal.score === 'good' ? '⭐' : '';

  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2.5 hover:shadow-sm transition-shadow">
      {/* Image + title row */}
      <div className="flex gap-2.5">
        {deal.image_url ? (
          <img src={deal.image_url} alt="" className="w-11 h-11 rounded-lg object-cover bg-muted shrink-0" loading="lazy" />
        ) : (
          <div className="w-11 h-11 rounded-lg bg-muted/60 flex items-center justify-center text-lg shrink-0">📱</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs leading-snug line-clamp-2">{deal.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-bold">{deal.price != null ? `${deal.price}€` : '—'}</span>
            {scoreEmoji && <span className={`text-[10px] font-bold ${scoreColor}`}>{scoreEmoji} {deal.score === 'fire' ? 'BRUTAL' : 'BUEN PRECIO'}</span>}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{timeAgo}</span>
        {deal.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{deal.location}</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Move back */}
        {canGoBack && (
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-muted-foreground" onClick={onMoveBack} disabled={isPending} title={PIPELINE_STAGES[STAGE_ORDER[stageIdx - 1]].label}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
        )}

        {/* Move forward — primary action with stage label */}
        {nextStage && (
          <Button
            size="sm"
            className={`h-6 px-2 text-[10px] flex-1 ${
              STAGE_ORDER[stageIdx + 1] === 'bought'
                ? 'bg-success hover:bg-success/90 text-white'
                : STAGE_ORDER[stageIdx + 1] === 'sold'
                ? 'bg-purple-500 hover:bg-purple-500/90 text-white'
                : 'bg-primary/10 hover:bg-primary/20 text-primary'
            }`}
            onClick={onMoveForward}
            disabled={isPending}
          >
            {nextStage.emoji} {nextStage.label} <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
          </Button>
        )}

        {/* Wallapop link */}
        <Button size="sm" variant="outline" className="h-6 px-1.5" asChild>
          <a href={deal.item_url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </Button>

        {/* Archive */}
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-muted-foreground/60 hover:text-muted-foreground" onClick={onArchive} disabled={isPending}>
          <Archive className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Pipeline column ────────────────────────────────────────────────────────
function PipelineColumn({
  stage,
  deals,
  onMove,
  onArchive,
  onBuy,
  isPending,
}: {
  stage: PipelineStatus;
  deals: Deal[];
  onMove: (deal: Deal, newStage: PipelineStatus) => void;
  onArchive: (id: string) => void;
  onBuy: (deal: Deal) => void;
  isPending: boolean;
}) {
  const cfg = PIPELINE_STAGES[stage];
  const stageIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className={`flex flex-col rounded-xl border ${cfg.border} overflow-hidden min-h-[160px] w-[220px] lg:w-auto shrink-0 lg:shrink`}>
      {/* Header */}
      <div className={`px-3 py-2.5 ${cfg.bg} border-b ${cfg.border}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{cfg.emoji}</span>
          <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badgeCls}`}>
            {deals.length}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.description}</p>
      </div>

      {/* Cards */}
      <div className={`flex-1 p-2 space-y-2 ${cfg.colBg} overflow-y-auto max-h-[calc(100dvh-280px)]`}>
        {deals.length === 0 ? (
          <div className="py-8 text-center text-[10px] text-muted-foreground/40">Sin anuncios</div>
        ) : (
          deals.map(deal => (
            <PipelineCard
              key={deal.id}
              deal={deal}
              onMoveBack={() => onMove(deal, STAGE_ORDER[stageIdx - 1])}
              onMoveForward={() => {
                const next = STAGE_ORDER[stageIdx + 1];
                if (next === 'bought') {
                  onBuy(deal);
                } else {
                  onMove(deal, next);
                }
              }}
              onArchive={() => onArchive(deal.id)}
              isPending={isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Pipeline page ────────────────────────────────────────────────────
const Pipeline = () => {
  const { toast } = useToast();
  const [buyDeal, setBuyDeal] = useState<Deal | null>(null);

  const { deals, isLoading, archive, updatePipeline } = useDeals({});

  // Group by pipeline_status
  const grouped = useMemo(() => {
    const map: Record<PipelineStatus, Deal[]> = {
      found: [], contacted: [], responded: [], bought: [], repairing: [], sold: [],
    };
    for (const deal of deals) {
      const s = getPipelineStatus(deal);
      map[s].push(deal);
    }
    return map;
  }, [deals]);

  // Stats
  const stats = useMemo(() => {
    const bought = grouped.bought.concat(grouped.repairing).concat(grouped.sold);
    const totalInvested = bought.reduce((s, d) => s + (d.price ?? 0), 0);
    const convRate = deals.length > 0 ? Math.round((grouped.contacted.length + grouped.responded.length + grouped.bought.length + grouped.repairing.length + grouped.sold.length) / deals.length * 100) : 0;
    return {
      total: deals.length,
      contacted: grouped.contacted.length + grouped.responded.length,
      bought: grouped.bought.length + grouped.repairing.length + grouped.sold.length,
      sold: grouped.sold.length,
      invested: totalInvested,
      convRate,
    };
  }, [deals, grouped]);

  const handleMove = (deal: Deal, newStage: PipelineStatus) => {
    updatePipeline.mutate({ id: deal.id, status: newStage }, {
      onError: () => toast({ title: 'Error', description: 'No se pudo mover el deal', variant: 'destructive' }),
    });
  };

  const handleBuyConfirmed = (deal: Deal) => {
    // Move to bought after stock is created
    updatePipeline.mutate({ id: deal.id, status: 'bought' });
    setBuyDeal(null);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <GitCommitHorizontal className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-xs text-muted-foreground">Sigue cada deal desde que el bot lo encuentra hasta que lo vendes</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">🎯 Total deals</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-0.5">activos · no archivados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">💬 Contactados</div>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stats.convRate}% conversión
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">🛒 Comprados</div>
            <div className="text-2xl font-bold">{stats.bought}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stats.invested.toFixed(0)}€ invertidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium mb-1">✅ Vendidos</div>
            <div className="text-2xl font-bold text-success">{stats.sold}</div>
            <div className="text-xs text-muted-foreground mt-0.5">este ciclo</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline tip */}
      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>Mueve cada deal por las fases con los botones de las tarjetas. Al marcarlo como <strong className="text-foreground">Comprado</strong> se añade automáticamente al Gestor de Stock.</span>
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map(s => <Skeleton key={s} className="h-64 w-[220px] lg:w-auto lg:flex-1 rounded-xl shrink-0" />)}
        </div>
      ) : (
        <div className="flex lg:grid lg:grid-cols-6 gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {STAGE_ORDER.map(stage => (
            <PipelineColumn
              key={stage}
              stage={stage}
              deals={grouped[stage]}
              onMove={handleMove}
              onArchive={id => archive.mutate(id)}
              onBuy={deal => setBuyDeal(deal)}
              isPending={updatePipeline.isPending || archive.isPending}
            />
          ))}
        </div>
      )}

      {deals.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No hay deals en el pipeline</p>
          <p className="text-xs mt-1 opacity-70">El bot irá llenando el pipeline en cuanto encuentre ofertas.</p>
        </div>
      )}

      {/* Quick buy sheet */}
      <QuickBuySheet
        deal={buyDeal}
        open={!!buyDeal}
        onClose={() => setBuyDeal(null)}
        onDone={() => handleBuyConfirmed(buyDeal!)}
      />
    </div>
  );
};

export default Pipeline;
