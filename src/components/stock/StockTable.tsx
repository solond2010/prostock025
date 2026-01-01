import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ShoppingCart } from 'lucide-react';
import { StockItemWithCalculations } from '@/types/stock';

interface StockTableProps {
  items: StockItemWithCalculations[];
  onItemClick: (item: StockItemWithCalculations) => void;
  onDuplicateClick: (item: StockItemWithCalculations) => void;
  onSellClick?: (item: StockItemWithCalculations) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export function StockTable({ items, onItemClick, onDuplicateClick, onSellClick }: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No hay productos en stock. Añade tu primer producto para empezar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card lg:shadow-sm">
      <Table className="crm-table">
        <TableHeader>
          <TableRow className="bg-secondary/70 hover:bg-secondary/70 border-b border-border">
            <TableHead className="font-semibold text-foreground/80">Nombre</TableHead>
            <TableHead className="font-semibold text-foreground/80">Estado</TableHead>
            <TableHead className="font-semibold text-foreground/80">Categoría</TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">Coste Total</TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">Beneficio</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground/80">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const beneficio = item.estado === 'Vendido' ? item.beneficio_real : item.beneficio_esperado;
            const isPositive = beneficio !== null && beneficio >= 0;
            const isEnStock = item.estado === 'En stock';
            
            return (
              <TableRow key={item.id} className="border-b border-border/50 last:border-b-0">
                <TableCell>
                  <button
                    onClick={() => onItemClick(item)}
                    className="font-medium text-primary hover:underline text-left"
                  >
                    {item.name}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={item.estado === 'Vendido' ? 'default' : 'secondary'}
                    className={item.estado === 'Vendido' ? 'bg-success text-success-foreground' : ''}
                  >
                    {item.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell className="table-cell-numeric">
                  {formatCurrency(item.coste_total)}
                </TableCell>
                <TableCell
                  className={`table-cell-numeric ${isPositive ? 'text-success' : 'text-destructive'}`}
                >
                  {beneficio !== null ? formatCurrency(beneficio) : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {isEnStock && onSellClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSellClick(item);
                        }}
                        title="Vender producto"
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Vender
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateClick(item);
                      }}
                      title="Duplicar producto"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
