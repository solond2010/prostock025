import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PersonalFinanceMovement, CATEGORIES } from '@/hooks/usePersonalFinance';

interface MovementsTableProps {
  movements: PersonalFinanceMovement[];
  monthLabel: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);

export function MovementsTable({ movements, monthLabel, onDelete, isDeleting }: MovementsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return movements.filter(mov => {
      const matchSearch = mov.concept.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || mov.type === typeFilter;
      const matchCat = categoryFilter === 'all' || mov.category === categoryFilter;
      return matchSearch && matchType && matchCat;
    });
  }, [movements, search, typeFilter, categoryFilter]);

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden"
      style={{ borderTop: '3px solid hsl(262,73%,55%)' }}>

      {/* Header + filters */}
      <div className="px-4 py-3 border-b border-border/40 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Historial — {monthLabel}</span>
          {filtered.length > 0 && (
            <span className="text-xs text-muted-foreground">{filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por concepto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-7 h-8 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Type pills */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5 gap-0.5">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'income', label: 'Ingresos', accent: 'hsl(var(--success))' },
              { value: 'expense', label: 'Gastos', accent: 'hsl(var(--destructive))' },
            ].map(opt => {
              const active = typeFilter === opt.value;
              return (
                <button key={opt.value} onClick={() => setTypeFilter(opt.value)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    active ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
                  style={active && opt.accent ? { background: opt.accent } : undefined}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Category */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-[150px] text-sm"><SelectValue placeholder="Categoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mb-3 opacity-15" />
          <p className="text-sm">No hay movimientos en este período</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/10">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Concepto</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoría</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Importe</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(mov => {
                const isIncome = mov.type === 'income';
                const accent = isIncome ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
                return (
                  <tr key={mov.id} className="table-row-premium">
                    <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                      {format(new Date(mov.date), 'dd/MM/yy', { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold border"
                        style={{ color: accent, background: `${accent.replace(')', '/0.1)').replace('hsl', 'hsl')}`, borderColor: `${accent.replace(')', '/0.3)').replace('hsl', 'hsl')}` }}
                      >
                        {isIncome
                          ? <TrendingUp className="h-2.5 w-2.5" />
                          : <TrendingDown className="h-2.5 w-2.5" />}
                        {isIncome ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{mov.concept}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-medium border border-border/50 bg-muted/40 text-muted-foreground">
                        {mov.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums" style={{ color: accent }}>
                      {isIncome ? '+' : '-'}{fmtEur(mov.amount)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors mx-auto">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente este movimiento.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(mov.id)} disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
