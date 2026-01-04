import { Package, TrendingUp, CheckCircle, AlertTriangle, Flame, Receipt, TrendingDown, ShoppingBag, CalendarDays } from 'lucide-react';
import { StockItem } from '@/types/stock';
import { useMemo } from 'react';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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

    // Monthly summary calculations
    const facturacionMes = vendidosEsteMesItems.reduce((sum, item) => sum + Number(item.precio_venta_real), 0);
    const beneficioMes = vendidosEsteMesItems.reduce((sum, item) => {
      const costeTotal = Number(item.purchase_price_per_unit) + Number(item.precio_envio) + Number(item.coste_reparacion);
      return sum + (Number(item.precio_venta_real) - costeTotal);
    }, 0);
    const mesActualLabel = format(now, 'MMMM yyyy', { locale: es });

    // Calculate days in stock alerts
    let reciente = 0;
    let enRiesgo = 0;
    let muerto = 0;

    enStockItems.forEach((item) => {
      if (!item.purchase_date) return;
      const days = differenceInDays(now, new Date(item.purchase_date));
      if (days <= 10) reciente++;
      else if (days <= 20) enRiesgo++;
      else muerto++;
    });

    return { enStock, vendidosEsteMes, reciente, enRiesgo, muerto, facturacionMes, beneficioMes, mesActualLabel };
  }, [items]);

  return (
    <TooltipProvider>
      <aside className={cn("w-52 shrink-0 sticky top-24", className)}>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-foreground tracking-tight">Inventario</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En stock</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.enStock}</p>
              </div>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vendidos mes</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.vendidosEsteMes}</p>
              </div>
            </div>
            
            {/* Alertas de Stock */}
            <div className="h-px bg-border/50" />
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Alertas de stock</h4>
            
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      Reciente <span className="text-[10px] opacity-60">(0–10 días)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Productos con 0 a 10 días en stock</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.reciente}</p>
              </div>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      En riesgo <span className="text-[10px] opacity-60">(11–20 días)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Productos con 11 a 20 días en stock</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.enRiesgo}</p>
              </div>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground cursor-default">
                      Muerto <span className="text-[10px] opacity-60">(21+ días)</span>
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Productos con más de 21 días en stock</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xl font-bold text-foreground tracking-tight">{stats.muerto}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del mes */}
        <div className="mt-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Resumen del mes</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4 capitalize">{stats.mesActualLabel}</p>
          
          {stats.vendidosEsteMes > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Receipt className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Facturación</p>
                  <p className="text-xl font-bold text-blue-500 tracking-tight">
                    {stats.facturacionMes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stats.beneficioMes >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {stats.beneficioMes >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Beneficio</p>
                  <p className={`text-xl font-bold tracking-tight ${stats.beneficioMes >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stats.beneficioMes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ventas</p>
                  <p className="text-xl font-bold text-foreground tracking-tight">{stats.vendidosEsteMes}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Aún no hay ventas este mes.</p>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
