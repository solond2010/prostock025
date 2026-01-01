import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
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

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'En stock', label: 'En stock' },
  { value: 'Vendido', label: 'Vendidos' },
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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre de producto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Status Filter Pills */}
      <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
              statusFilter === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todas las Categorías" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="all">Todas las Categorías</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
