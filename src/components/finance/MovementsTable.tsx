import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalFinanceMovement, CATEGORIES } from '@/hooks/usePersonalFinance';

interface MovementsTableProps {
  movements: PersonalFinanceMovement[];
  monthLabel: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function MovementsTable({ movements, monthLabel, onDelete, isDeleting }: MovementsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      const matchesSearch = mov.concept.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || mov.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || mov.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [movements, search, typeFilter, categoryFilter]);

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Historial de movimientos - {monthLabel}</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por concepto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay movimientos en este período
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(movement.date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={movement.type === 'income' ? 'default' : 'destructive'}
                        className={movement.type === 'income' ? 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-600 hover:bg-red-500/30'}
                      >
                        {movement.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movement.concept}
                    </TableCell>
                    <TableCell>{movement.category}</TableCell>
                    <TableCell className={`text-right font-medium ${movement.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {movement.type === 'income' ? '+' : '-'}
                      {movement.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                            <AlertDialogAction
                              onClick={() => onDelete(movement.id)}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
