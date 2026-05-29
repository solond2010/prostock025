import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  statusFilter: 'all' | 'En stock' | 'Vendido';
  onStatusChange: (value: 'all' | 'En stock' | 'Vendido') => void;
}

const STATUS_OPTIONS = [
  { value: 'all',      label: 'Todos',    accent: 'hsl(var(--muted-foreground))' },
  { value: 'En stock', label: 'En stock', accent: 'hsl(160,84%,38%)' },
  { value: 'Vendido',  label: 'Vendidos', accent: 'hsl(262,73%,55%)' },
] as const;

export function StockFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  statusFilter,
  onStatusChange,
}: StockFiltersProps) {
  const hasActiveFilter = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar producto..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-1 gap-0.5 order-first sm:order-none">
        {STATUS_OPTIONS.map(opt => {
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                'relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
                active
                  ? 'text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
              style={active ? { background: opt.accent, boxShadow: `0 2px 8px -2px ${opt.accent}60` } : undefined}
            >
              {opt.value === 'En stock' && active && (
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              )}
              <span className={opt.value === 'En stock' && active ? 'pl-2.5' : ''}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category */}
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
