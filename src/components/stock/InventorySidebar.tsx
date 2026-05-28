import { Package, TrendingUp, CheckCircle, AlertTriangle, Flame, Receipt, TrendingDown, ShoppingBag, CalendarDays, Trophy, Clock } from 'lucide-react';
import { StockItem } from '@/types/stock';
import { useMemo } from 'react';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InventorySidebarProps {
  items: StockItem[];
  className?: string;
}

export function InventorySidebar({ items, className }: InventorySidebarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const enStockItems = items.filter((item) => item.estado === 'En stock');
    const enStock = enStockItems.length;

    const vendidosEsteMesItems = items.filter((item) => {
      if (item.estado !== 'Vendido' || !item.fecha_venta) return false;
      const saleDate = new Date(item.fecha_venta);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    const vendidosEsteMes = vendidosEsteMesItems.length;

    // Monthly summary
    const facturacionMes = vendidosEsteMesItems.reduce((sum, item) => sum + Number(item.precio_venta_real), 0);
    const beneficioMes = vendidosEsteMesItems.reduce((sum, item) => {
      const costeTotal = Number(item.purchase_price_per_unit) + Number(item.precio_envio) + Number(item.coste_reparacion);
      return sum + (Number(item.precio_venta_real) - costeTotal);
    }, 0);
    const mesActualLabel = format(now, 'MMMM yyyy', { locale: es });

    // Margen medio del mes
    const margenMedio = vendidosEsteMesItems.length > 0
      ? vendidosEsteMesItems.reduce((sum, item) => {
          const costeTotal = Number(item.purchase_price_per_unit) + Number(item.precio_envio) + Number(item.coste_reparacion);
          const pv = Number(item.precio_venta_real);
          return sum + (pv > 0 ? ((pv - costeTotal) / pv) * 100 : 0);
        }, 0) / vendidosEsteMesItems.length
      : 0;

    // Mejor venta del mes
    const bestItem = vendidosEsteMesItems.length > 0
      ? vendidosEsteMesItems.reduce((best, item) => {
          const costeTotal = Number(item.purchase_price_per_unit) + Number(item.precio_envio) + Number(item.coste_reparacion);
          const benItem = Number(item.precio_venta_real) - costeTotal;
          const costeBest = Number(best.purchase_price_per_unit) + Number(best.precio_envio) + Number(best.coste_reparacion);
          const benBest = Number(best.precio_venta_real) - costeBest;
          return benItem > benBest ? item : best;
        }, vendidosEsteMesItems[0])
      : null;
    const bestItemBen = bestItem
      ? Number(bestItem.precio_venta_real) - (Number(bestItem.purchase_price_per_unit) + Number(bestItem.precio_envio) + Number(bestItem.coste_reparacion))
      : 0;

    // Días promedio de venta (todos los items con ambas fechas)
    const withBoth = items.filter(i => i.estado === 'Vendido' && i.fecha_venta && i.purchase_date);
    const avgDays = withBoth.length > 0
      ? Math.round(withBoth.reduce((s, i) => s + differenceInDays(new Date(i.fecha_venta!), new Date(i.purchase_date)), 0) / withBoth.length)
      : null;

    // Stock alerts
    let reciente = 0, enRiesgo = 0, muerto = 0;
    enStockItems.forEach((item) => {
      if (!item.purchase_date) return;
      const days = differenceInDays(now, new Date(item.purchase_date));
      if (days <= 10) reciente++;
      else if (days <= 20) enRiesgo++;
      else muerto++;
    });

    return {
      enStock, vendidosEsteMes, reciente, enRiesgo, muerto,
      facturacionMes, beneficioMes, margenMedio,
      mesActualLabel, bestItem, bestItemBen, avgDays,
    };
  }, [items]);

  return (
    <TooltipProvider>
      <aside className={cn("w-52 shrink-0 sticky top-24 space-y-4", className)}>

        {/* Inventario */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground tracking-tight">Inventario</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En stock</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.enStock}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vendidos mes</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.vendidosEsteMes}</p>
              </div>
            </div>
            {stats.avgDays !== null && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Días prom. venta</p>
                  <p className="text-xl font-bold text-foreground tracking-tight">{stats.avgDays}d</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground tracking-tight">Alertas de stock</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      Reciente <span className="text-[10px] opacity-60">(0–10d)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent><p>Productos con 0 a 10 días en stock</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm font-bold text-foreground">{stats.reciente}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      En riesgo <span className="text-[10px] opacity-60">(11–20d)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent><p>Productos con 11 a 20 días en stock</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm font-bold text-warning">{stats.enRiesgo}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-destructive" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      Parado <span className="text-[10px] opacity-60">(21+d)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent><p>Productos con más de 21 días en stock</p></TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm font-bold text-destructive">{stats.muerto}</p>
            </div>
            {/* Mini bar */}
            {stats.enStock > 0 && (
              <div className="pt-1">
                <div className="flex h-2 w-full rounded-full overflow-hidden gap-px">
                  {stats.reciente > 0 && (
                    <div className="bg-success/70 rounded-l-full" style={{ flex: stats.reciente }} />
                  )}
                  {stats.enRiesgo > 0 && (
                    <div className="bg-warning/70" style={{ flex: stats.enRiesgo }} />
                  )}
                  {stats.muerto > 0 && (
                    <div className="bg-destructive/70 rounded-r-full" style={{ flex: stats.muerto }} />
                  )}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>Bien</span><span>Riesgo</span><span>Parado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen del mes */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Este mes</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 capitalize">{stats.mesActualLabel}</p>

          {stats.vendidosEsteMes > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Facturado</p>
                </div>
                <p className="text-sm font-bold text-blue-500">
                  {stats.facturacionMes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {stats.beneficioMes >= 0
                    ? <TrendingUp className="h-3.5 w-3.5 text-success" />
                    : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                  <p className="text-xs text-muted-foreground">Beneficio</p>
                </div>
                <p className={`text-sm font-bold ${stats.beneficioMes >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.beneficioMes >= 0 ? '+' : ''}
                  {stats.beneficioMes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground">Ventas</p>
                </div>
                <p className="text-sm font-bold text-foreground">{stats.vendidosEsteMes}</p>
              </div>
              {/* Margen medio */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-muted-foreground">Margen medio</p>
                  <p className={`text-xs font-bold ${stats.margenMedio >= 20 ? 'text-success' : stats.margenMedio >= 10 ? 'text-amber-500' : 'text-destructive'}`}>
                    {stats.margenMedio.toFixed(1)}%
                  </p>
                </div>
                <Progress
                  value={Math.min(stats.margenMedio, 100)}
                  className="h-1.5"
                />
              </div>
              {/* Mejor venta */}
              {stats.bestItem && (
                <div className="pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Trophy className="h-3 w-3 text-amber-500" />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Mejor venta</p>
                  </div>
                  <p className="text-xs font-medium truncate leading-tight">{stats.bestItem.name}</p>
                  <p className="text-sm font-bold text-success">+{stats.bestItemBen.toFixed(0)}€</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aún no hay ventas este mes.</p>
          )}
        </div>

      </aside>
    </TooltipProvider>
  );
}
