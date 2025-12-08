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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

export function StockTable({ items, onEdit, onDelete }: StockTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No stock items found. Add your first item to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Purchase Date</TableHead>
            <TableHead className="text-right font-semibold">Units</TableHead>
            <TableHead className="text-right font-semibold">Buy Price</TableHead>
            <TableHead className="text-right font-semibold">Sell Price</TableHead>
            <TableHead className="text-right font-semibold">Invested</TableHead>
            <TableHead className="text-right font-semibold">Revenue</TableHead>
            <TableHead className="text-right font-semibold">Profit</TableHead>
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
                {format(new Date(item.purchase_date), 'MMM d, yyyy')}
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
