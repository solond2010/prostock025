import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockItemWithCalculations } from '@/types/stock';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface StockTableProps {
  items: StockItemWithCalculations[];
  onEdit: (item: StockItemWithCalculations) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export function StockTable({ items, onEdit, onDelete }: StockTableProps) {
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
            <TableHead className="font-semibold">Categoría</TableHead>
            <TableHead className="font-semibold">Fecha de Compra</TableHead>
            <TableHead className="text-right font-semibold">Uds.</TableHead>
            <TableHead className="text-right font-semibold">Precio Compra</TableHead>
            <TableHead className="text-right font-semibold">Precio Venta</TableHead>
            <TableHead className="text-right font-semibold">Invertido</TableHead>
            <TableHead className="text-right font-semibold">Ingresos</TableHead>
            <TableHead className="text-right font-semibold">Beneficio</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-secondary/30">
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(item.purchase_date), 'd MMM yyyy')}
              </TableCell>
              <TableCell className="table-cell-numeric">{item.units_in_stock}</TableCell>
              <TableCell className="table-cell-numeric">
                {formatCurrency(item.purchase_price_per_unit)}
              </TableCell>
              <TableCell className="table-cell-numeric">
                {formatCurrency(item.sale_price_per_unit)}
              </TableCell>
              <TableCell className="table-cell-numeric">{formatCurrency(item.invested)}</TableCell>
              <TableCell className="table-cell-numeric text-primary">
                {formatCurrency(item.expected_revenue)}
              </TableCell>
              <TableCell
                className={`table-cell-numeric ${
                  item.expected_profit >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {formatCurrency(item.expected_profit)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
