import { useMemo, useState } from 'react';
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
import {
  Copy, ShoppingCart, ChevronDown, CheckCircle, AlertTriangle,
  Flame, Circle, Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { StockItemWithCalculations } from '@/types/stock';
import { differenceInDays } from 'date-fns';
import { ProductNameTooltip } from './ProductNameTooltip';

export type DaysInStockFilter = 'all' | 'recent' | 'atrisk' | 'dead';
type SortKey = 'name' | 'estado' | 'category' | 'days' | 'coste' | 'beneficio' | 'margen';
type SortDir = 'asc' | 'desc';

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

const fmt = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const filterOptions: { value: DaysInStockFilter; label: string; shortLabel: string; icon: typeof Circle; colorClass: string }[] = [
  { value: 'all', label: 'Todos', shortLabel: 'Todos', icon: Circle, colorClass: 'text-muted-foreground' },
  { value: 'recent', label: 'Recientes (0–10 días)', shortLabel: 'Recientes', icon: CheckCircle, colorClass: 'text-success' },
  { value: 'atrisk', label: 'En riesgo (11–20 días)', shortLabel: 'En riesgo', icon: AlertTriangle, colorClass: 'text-warning' },
  { value: 'dead', label: 'Muerto (21+ días)', shortLabel: 'Muerto', icon: Flame, colorClass: 'text-destructive' },
];

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp className="h-3 w-3 ml-1 inline text-primary" />
    : <ArrowDown className="h-3 w-3 ml-1 inline text-primary" />;
}

export function StockTable({
  items,
  onItemClick,
  onDuplicateClick,
  onSellClick,
  onEditClick,
  onDeleteClick,
  recentlySoldId,
  daysInStockFilter = 'all',
  onDaysInStockFilterChange,
}: StockTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter + sort
  const filteredItems = useMemo(() => {
    let list = daysInStockFilter === 'all'
      ? items
      : items.filter((item) => {
          const days = getDaysInStock(item.purchase_date, item.estado);
          return getDaysFilterCategory(days) === daysInStockFilter;
        });

    list = [...list].sort((a, b) => {
      let va: any, vb: any;
      const benA = a.estado === 'Vendido' ? a.beneficio_real ?? 0 : a.beneficio_esperado ?? 0;
      const benB = b.estado === 'Vendido' ? b.beneficio_real ?? 0 : b.beneficio_esperado ?? 0;
      const marA = a.coste_total > 0 ? (benA / a.coste_total) * 100 : 0;
      const marB = b.coste_total > 0 ? (benB / b.coste_total) * 100 : 0;
      const daysA = getDaysInStock(a.purchase_date, a.estado) ?? Infinity;
      const daysB = getDaysInStock(b.purchase_date, b.estado) ?? Infinity;

      switch (sortKey) {
        case 'name':      va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'estado':    va = a.estado; vb = b.estado; break;
        case 'category':  va = a.category; vb = b.category; break;
        case 'days':      va = daysA; vb = daysB; break;
        case 'coste':     va = a.coste_total; vb = b.coste_total; break;
        case 'beneficio': va = benA; vb = benB; break;
        case 'margen':    va = marA; vb = marB; break;
        default: va = 0; vb = 0;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [items, daysInStockFilter, sortKey, sortDir]);

  // Aggregate stats for visible items
  const aggStats = useMemo(() => {
    const totalCoste = filteredItems.reduce((s, i) => s + i.coste_total, 0);
    const totalBen = filteredItems.reduce((s, i) => {
      const b = i.estado === 'Vendido' ? (i.beneficio_real ?? 0) : (i.beneficio_esperado ?? 0);
      return s + b;
    }, 0);
    const vendidos = filteredItems.filter(i => i.estado === 'Vendido').length;
    const enStock = filteredItems.filter(i => i.estado === 'En stock').length;
    return { totalCoste, totalBen, vendidos, enStock, count: filteredItems.length };
  }, [filteredItems]);

  const selectedOption = filterOptions.find(o => o.value === daysInStockFilter) || filterOptions[0];
  const SelectedIcon = selectedOption.icon;

  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card text-muted-foreground">
        No hay productos en stock. Añade tu primer producto para empezar.
      </div>
    );
  }

  const thCls = "font-semibold text-foreground/80 cursor-pointer select-none hover:text-foreground transition-colors";

  return (
    <div className="space-y-2">
      {/* Aggregate summary bar */}
      {filteredItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{aggStats.count} productos</span>
          <span>·</span>
          <span>{aggStats.enStock} en stock</span>
          <span>·</span>
          <span>{aggStats.vendidos} vendidos</span>
          <span className="ml-auto flex gap-3">
            <span>Coste total: <strong className="text-foreground">{fmt(aggStats.totalCoste)}</strong></span>
            <span className={aggStats.totalBen >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              Beneficio: {aggStats.totalBen >= 0 ? '+' : ''}{fmt(aggStats.totalBen)}
            </span>
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table className="crm-table">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/60">
              <TableHead className={thCls} onClick={() => handleSort('name')}>
                Nombre <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className={thCls} onClick={() => handleSort('estado')}>
                Estado <SortIcon col="estado" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className={thCls} onClick={() => handleSort('category')}>
                Categoría <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className="text-center font-semibold text-foreground/80">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('days')}
                  >
                    Días en stock <SortIcon col="days" sortKey={sortKey} sortDir={sortDir} />
                  </span>
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
              <TableHead className={`text-right ${thCls}`} onClick={() => handleSort('coste')}>
                Coste <SortIcon col="coste" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className={`text-right ${thCls}`} onClick={() => handleSort('beneficio')}>
                Beneficio <SortIcon col="beneficio" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
              <TableHead className={`text-right ${thCls}`} onClick={() => handleSort('margen')}>
                Margen <SortIcon col="margen" sortKey={sortKey} sortDir={sortDir} />
              </TableHead>
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
                const margen = beneficio !== null && item.coste_total > 0
                  ? (beneficio / item.coste_total) * 100
                  : null;

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
                      {fmt(item.coste_total)}
                    </TableCell>
                    <TableCell className={`table-cell-numeric font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {beneficio !== null ? `${beneficio >= 0 ? '+' : ''}${fmt(beneficio)}` : '-'}
                    </TableCell>
                    <TableCell className="table-cell-numeric">
                      {margen !== null ? (
                        <span className={margen >= 0 ? 'text-success' : 'text-destructive'}>
                          {margen >= 0 ? '' : ''}{margen.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {isEnStock && onSellClick && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); onSellClick(item); }}
                                className="h-9 w-9 text-success/90 hover:text-success hover:bg-success/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--success)/0.5)] transition-all duration-200 rounded-full"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Vender</TooltipContent>
                          </Tooltip>
                        )}
                        {onEditClick && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); onEditClick(item); }}
                                className="h-9 w-9 text-primary/90 hover:text-primary hover:bg-primary/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--primary)/0.5)] transition-all duration-200 rounded-full"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Editar</TooltipContent>
                          </Tooltip>
                        )}
                        {onDeleteClick && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); onDeleteClick(item); }}
                                className="h-9 w-9 text-destructive/90 hover:text-destructive hover:bg-destructive/20 hover:scale-110 hover:shadow-[0_0_12px_hsl(var(--destructive)/0.5)] transition-all duration-200 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Eliminar</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); onDuplicateClick(item); }}
                              className="h-9 w-9 text-muted-foreground/90 hover:text-foreground hover:bg-muted/60 hover:scale-110 transition-all duration-200 rounded-full"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Duplicar</TooltipContent>
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
    </div>
  );
}
