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
    <aside className="w-56 shrink-0">
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Inventario</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Productos en stock</p>
              <p className="text-lg font-semibold text-foreground">{stats.enStock}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendidos este mes</p>
              <p className="text-lg font-semibold text-foreground">{stats.vendidosEsteMes}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
