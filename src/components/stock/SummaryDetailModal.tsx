import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, DollarSign, TrendingUp, Percent } from 'lucide-react';
import { StockItem } from '@/types/stock';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ModalType = 'invested' | 'revenue' | 'profit' | 'margin';

interface SummaryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ModalType;
  stockItems: StockItem[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
};

const modalConfig = {
  invested: {
    title: 'Total Invertido Actual',
    icon: Package,
    color: 'text-foreground',
  },
  revenue: {
    title: 'Ingresos Esperados Actuales',
    icon: DollarSign,
    color: 'text-primary',
  },
  profit: {
    title: 'Beneficio Posible Actual',
    icon: TrendingUp,
    color: 'text-success',
  },
  margin: {
    title: 'Margen Posible Actual',
    icon: Percent,
    color: 'text-success',
  },
};

export function SummaryDetailModal({ open, onOpenChange, type, stockItems }: SummaryDetailModalProps) {
  const [search, setSearch] = useState('');

  const inStockItems = useMemo(() => 
    stockItems.filter(item => item.estado === 'En stock'),
    [stockItems]
  );

  const filteredItems = useMemo(() => {
    if (!search.trim()) return inStockItems;
    const searchLower = search.toLowerCase();
    return inStockItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  }, [inStockItems, search]);

  const calculateItemCost = (item: StockItem) => {
    return item.purchase_price_per_unit + item.coste_reparacion;
  };

  const calculateItemProfit = (item: StockItem) => {
    return item.sale_price_per_unit - calculateItemCost(item);
  };

  const calculateItemMargin = (item: StockItem) => {
    if (item.sale_price_per_unit === 0) return 0;
    return (calculateItemProfit(item) / item.sale_price_per_unit) * 100;
  };

  const totals = useMemo(() => {
    const totalInvested = inStockItems.reduce((sum, item) => sum + calculateItemCost(item), 0);
    const totalRevenue = inStockItems.reduce((sum, item) => sum + item.sale_price_per_unit, 0);
    const totalProfit = totalRevenue - totalInvested;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalInvested, totalRevenue, totalProfit, margin };
  }, [inStockItems]);

  const sortedItems = useMemo(() => {
    if (type === 'margin') {
      return [...filteredItems].sort((a, b) => calculateItemMargin(b) - calculateItemMargin(a));
    }
    return filteredItems;
  }, [filteredItems, type]);

  const config = modalConfig[type];
  const Icon = config.icon;

  const getTotalValue = () => {
    switch (type) {
      case 'invested': return formatCurrency(totals.totalInvested);
      case 'revenue': return formatCurrency(totals.totalRevenue);
      case 'profit': return formatCurrency(totals.totalProfit);
      case 'margin': return `${totals.margin.toFixed(1)}%`;
    }
  };

  const renderTableHeaders = () => {
    switch (type) {
      case 'invested':
        return (
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Coste total (€)</TableHead>
            <TableHead className="text-right">Fecha compra</TableHead>
          </TableRow>
        );
      case 'revenue':
        return (
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio venta esperado (€)</TableHead>
          </TableRow>
        );
      case 'profit':
        return (
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Coste total (€)</TableHead>
            <TableHead className="text-right">Precio venta esperado (€)</TableHead>
            <TableHead className="text-right">Beneficio posible (€)</TableHead>
          </TableRow>
        );
      case 'margin':
        return (
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Margen posible (%)</TableHead>
            <TableHead className="text-right">Beneficio posible (€)</TableHead>
            <TableHead className="text-right">Precio venta esperado (€)</TableHead>
          </TableRow>
        );
    }
  };

  const renderTableRow = (item: StockItem) => {
    const cost = calculateItemCost(item);
    const profit = calculateItemProfit(item);
    const margin = calculateItemMargin(item);

    switch (type) {
      case 'invested':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
            <TableCell className="text-right">{formatDate(item.purchase_date)}</TableCell>
          </TableRow>
        );
      case 'revenue':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.sale_price_per_unit)}</TableCell>
          </TableRow>
        );
      case 'profit':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.sale_price_per_unit)}</TableCell>
            <TableCell className={`text-right font-medium ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(profit)}
            </TableCell>
          </TableRow>
        );
      case 'margin':
        return (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className={`text-right font-medium ${margin >= 0 ? 'text-success' : 'text-destructive'}`}>
              {margin.toFixed(1)}%
            </TableCell>
            <TableCell className={`text-right ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(profit)}
            </TableCell>
            <TableCell className="text-right">{formatCurrency(item.sale_price_per_unit)}</TableCell>
          </TableRow>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.color}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 border-b">
          <div className="flex items-center justify-center gap-3 py-4 bg-secondary/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className={`text-2xl sm:text-3xl font-bold ${config.color}`}>
              {getTotalValue()}
            </span>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-center">
                {inStockItems.length === 0 
                  ? 'No hay productos en stock actualmente'
                  : 'No se encontraron productos con ese nombre'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                {renderTableHeaders()}
              </TableHeader>
              <TableBody>
                {sortedItems.map(renderTableRow)}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 border-t bg-muted/30 text-sm text-muted-foreground text-center">
          {sortedItems.length} de {inStockItems.length} productos en stock
        </div>
      </DialogContent>
    </Dialog>
  );
}
