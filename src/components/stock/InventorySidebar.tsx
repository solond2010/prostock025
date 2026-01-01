import { Package, TrendingUp, Clock } from 'lucide-react';
import { StockItem } from '@/types/stock';
import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface InventorySidebarProps {
  items: StockItem[];
}

export function InventorySidebar({ items }: InventorySidebarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const enStockItems = items.filter((item) => item.estado === 'En stock');
    const enStock = enStockItems.length;

    const vendidosEsteMes = items.filter((item) => {
      if (item.estado !== 'Vendido' || !item.fecha_venta) return false;
      const saleDate = new Date(item.fecha_venta);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).length;

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

    return { enStock, vendidosEsteMes, reciente, enRiesgo, muerto };
  }, [items]);

  return (
    <aside className="w-52 shrink-0 sticky top-24">
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
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alertas de Stock</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">🟢 Reciente (0–10d)</span>
                <Badge variant="outline" className="h-5 min-w-[28px] justify-center bg-success/15 text-success border-success/30 text-xs font-medium">
                  {stats.reciente}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">🟡 En riesgo (11–20d)</span>
                <Badge variant="outline" className="h-5 min-w-[28px] justify-center bg-warning/15 text-warning border-warning/30 text-xs font-medium">
                  {stats.enRiesgo}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">🔴 Muerto (21+d)</span>
                <Badge variant="outline" className="h-5 min-w-[28px] justify-center bg-destructive/15 text-destructive border-destructive/30 text-xs font-medium">
                  {stats.muerto}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
