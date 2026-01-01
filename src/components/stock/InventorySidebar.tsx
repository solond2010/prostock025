import { Package, TrendingUp } from 'lucide-react';
import { StockItem } from '@/types/stock';
import { useMemo } from 'react';

interface InventorySidebarProps {
  items: StockItem[];
}

export function InventorySidebar({ items }: InventorySidebarProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const enStock = items.filter((item) => item.estado === 'En stock').length;

    const vendidosEsteMes = items.filter((item) => {
      if (item.estado !== 'Vendido' || !item.fecha_venta) return false;
      const saleDate = new Date(item.fecha_venta);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).length;

    return { enStock, vendidosEsteMes };
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
        </div>
      </div>
    </aside>
  );
}
