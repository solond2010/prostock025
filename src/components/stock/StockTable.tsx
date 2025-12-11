import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StockItemWithCalculations } from '@/types/stock';

interface StockTableProps {
  items: StockItemWithCalculations[];
  onItemClick: (item: StockItemWithCalculations) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export function StockTable({ items, onItemClick }: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No hay productos en stock. Añade tu primer producto para empezar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Categoría</TableHead>
            <TableHead className="text-right font-semibold">Coste Total</TableHead>
            <TableHead className="text-right font-semibold">Beneficio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const beneficio = item.estado === 'Vendido' ? item.beneficio_real : item.beneficio_esperado;
            const isPositive = beneficio !== null && beneficio >= 0;
            
            return (
              <TableRow key={item.id} className="hover:bg-secondary/30">
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
