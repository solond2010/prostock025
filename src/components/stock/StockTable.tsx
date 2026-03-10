import { useMemo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, ShoppingCart, ChevronDown, CheckCircle, AlertTriangle, Flame, Circle, Pencil, Trash2 } from 'lucide-react';
import { StockItemWithCalculations } from '@/types/stock';
import { differenceInDays } from 'date-fns';
import { ProductNameTooltip } from './ProductNameTooltip';

export type DaysInStockFilter = 'all' | 'recent' | 'atrisk' | 'dead';

const getDaysInStock = (purchaseDate: string | null | undefined, estado: string): number | null => {
  if (estado !== 'En stock' || !purchaseDate) return null;
  const days = differenceInDays(new Date(), new Date(purchaseDate));
  return Math.max(0, days);
};

const getDaysInStockVariant = (days: number | null): 'success' | 'warning' | 'destructive' | null => {
  if (days === null) return null;
  if (days <= 10) return 'success';
  if (days <= 20) return 'warning';
  return 'destructive';
};

const getDaysFilterCategory = (days: number | null): DaysInStockFilter | null => {
  if (days === null) return null;
  if (days <= 10) return 'recent';
  if (days <= 20) return 'atrisk';
  return 'dead';
};

interface StockTableProps {
  items: StockItemWithCalculations[];
  onItemClick: (item: StockItemWithCalculations) => void;
  onDuplicateClick: (item: StockItemWithCalculations) => void;
  onSellClick?: (item: StockItemWithCalculations) => void;
  onEditClick?: (item: StockItemWithCalculations) => void;
  onDeleteClick?: (item: StockItemWithCalculations) => void;
  recentlySoldId?: string | null;
  daysInStockFilter?: DaysInStockFilter;
  onDaysInStockFilterChange?: (filter: DaysInStockFilter) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const filterOptions: { value: DaysInStockFilter; label: string; shortLabel: string; icon: typeof Circle; colorClass: string }[] = [
  { value: 'all', label: 'Todos', shortLabel: 'Todos', icon: Circle, colorClass: 'text-muted-foreground' },
  { value: 'recent', label: 'Recientes (0–10 días)', shortLabel: 'Recientes', icon: CheckCircle, colorClass: 'text-success' },
  { value: 'atrisk', label: 'En riesgo (11–20 días)', shortLabel: 'En riesgo', icon: AlertTriangle, colorClass: 'text-warning' },
  { value: 'dead', label: 'Muerto (21+ días)', shortLabel: 'Muerto', icon: Flame, colorClass: 'text-destructive' },
];

export function StockTable({ 
  items, 
  onItemClick, 
  onDuplicateClick, 
  onSellClick, 
  onEditClick,
  onDeleteClick,
  recentlySoldId,
  daysInStockFilter = 'all',
  onDaysInStockFilterChange 
}: StockTableProps) {
  
  // Filter items based on days in stock filter
  const filteredItems = useMemo(() => {
    if (daysInStockFilter === 'all') return items;
    
    return items.filter((item) => {
      const days = getDaysInStock(item.purchase_date, item.estado);
      const category = getDaysFilterCategory(days);
      return category === daysInStockFilter;
    });
  }, [items, daysInStockFilter]);

  const selectedOption = filterOptions.find(o => o.value === daysInStockFilter) || filterOptions[0];
  const SelectedIcon = selectedOption.icon;

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No hay productos en stock. Añade tu primer producto para empezar.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Table className="crm-table">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
            <TableHead className="font-semibold text-foreground/80">Nombre</TableHead>
            <TableHead className="font-semibold text-foreground/80">Estado</TableHead>
            <TableHead className="font-semibold text-foreground/80">Categoría</TableHead>
            <TableHead className="text-center font-semibold text-foreground/80">
              <div className="flex items-center justify-center gap-2">
                <span>Días en stock</span>
                {onDaysInStockFilterChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-border/60 bg-background/50 hover:bg-muted/80 transition-colors backdrop-blur-sm">
                        {daysInStockFilter !== 'all' && (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            daysInStockFilter === 'recent' ? 'bg-success' :
                            daysInStockFilter === 'atrisk' ? 'bg-warning' :
                            'bg-destructive'
                          }`} />
                        )}
                        <span className="text-foreground/70">{selectedOption.shortLabel}</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="min-w-[180px] bg-popover border border-border/60 backdrop-blur-sm">
                      {filterOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => onDaysInStockFilterChange(option.value)}
                            className={`flex items-center gap-2 cursor-pointer ${
                              daysInStockFilter === option.value ? 'bg-muted/50' : ''
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${option.colorClass}`} />
                            <span className="text-sm">{option.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">Coste Total</TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">Beneficio</TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">Margen</TableHead>
            <TableHead className="w-[150px] text-center font-semibold text-foreground/80">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <SelectedIcon className={`h-8 w-8 ${selectedOption.colorClass} opacity-50`} />
                  <span>No hay productos en este rango de días.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => {
              const beneficio = item.estado === 'Vendido' ? item.beneficio_real : item.beneficio_esperado;
              const isPositive = beneficio !== null && beneficio >= 0;
              const isEnStock = item.estado === 'En stock';
              const isRecentlySold = item.id === recentlySoldId;
              const daysInStock = getDaysInStock(item.purchase_date, item.estado);
              const daysVariant = getDaysInStockVariant(daysInStock);
              
              return (
                <TableRow 
                  key={item.id} 
                  className={`group border-b border-border/50 last:border-b-0 ${isRecentlySold ? 'sale-highlight' : ''}`}
                >
                  <TableCell>
                    <ProductNameTooltip item={item} onClick={() => onItemClick(item)} />
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.estado === 'Vendido' ? 'default' : 'secondary'}
                      className={`badge-animated ${item.estado === 'Vendido' ? 'bg-success text-success-foreground' : ''}`}
                    >
                      {item.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {daysInStock !== null ? (
                      <Badge 
                        variant="outline"
                        className={`font-medium ${
                          daysVariant === 'success' 
                            ? 'bg-success/15 text-success border-success/30' 
                            : daysVariant === 'warning'
                            ? 'bg-warning/15 text-warning border-warning/30'
                            : 'bg-destructive/15 text-destructive border-destructive/30'
                        }`}
                      >
                        {daysInStock}d
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
                    <div className="flex items-center justify-center gap-0.5">
                      {isEnStock && onSellClick && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSellClick(item);
                              }}
                              className="h-9 w-9 text-success/90 hover:text-success hover:bg-success/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--success)/0.5)] hover:backdrop-blur-sm transition-all duration-200 rounded-full"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover border border-border/60 text-xs">
                            Vender
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {onEditClick && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(item);
                              }}
                              className="h-9 w-9 text-primary/90 hover:text-primary hover:bg-primary/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] hover:backdrop-blur-sm transition-all duration-200 rounded-full"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover border border-border/60 text-xs">
                            Editar
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {onDeleteClick && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(item);
                              }}
                              className="h-9 w-9 text-destructive/90 hover:text-destructive hover:bg-destructive/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--destructive)/0.5)] hover:backdrop-blur-sm transition-all duration-200 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover border border-border/60 text-xs">
                            Eliminar
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateClick(item);
                            }}
                            className="h-9 w-9 text-muted-foreground/90 hover:text-foreground hover:bg-muted/60 hover:scale-110 hover:shadow-[0_0_8px_hsl(var(--muted-foreground)/0.3)] hover:backdrop-blur-sm transition-all duration-200 rounded-full"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover border border-border/60 text-xs">
                          Duplicar
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
