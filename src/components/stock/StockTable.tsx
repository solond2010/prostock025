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
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Categoría</TableHead>
            <TableHead className="text-right font-semibold">Uds.</TableHead>
            <TableHead className="text-right font-semibold">Coste Total</TableHead>
            <TableHead className="text-right font-semibold">Precio Venta Esp.</TableHead>
            <TableHead className="text-right font-semibold">Benef. Esperado</TableHead>
            <TableHead className="text-right font-semibold">Precio Venta Real</TableHead>
            <TableHead className="text-right font-semibold">Benef. Real</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-secondary/30">
              <TableCell className="font-medium">{item.name}</TableCell>
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
              <TableCell className="table-cell-numeric">{item.units_in_stock}</TableCell>
              <TableCell className="table-cell-numeric">
                {formatCurrency(item.coste_total)}
              </TableCell>
              <TableCell className="table-cell-numeric text-muted-foreground">
                {formatCurrency(item.sale_price_per_unit * item.units_in_stock)}
              </TableCell>
              <TableCell
                className={`table-cell-numeric ${
                  item.beneficio_esperado >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {formatCurrency(item.beneficio_esperado)}
              </TableCell>
              <TableCell className="table-cell-numeric">
                {item.estado === 'Vendido' ? formatCurrency(item.precio_venta_real) : '-'}
              </TableCell>
              <TableCell
                className={`table-cell-numeric ${
                  item.beneficio_real !== null
                    ? item.beneficio_real >= 0
                      ? 'text-success'
                      : 'text-destructive'
                    : ''
                }`}
              >
                {item.beneficio_real !== null ? formatCurrency(item.beneficio_real) : '-'}
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
