import { useState, useMemo } from 'react';
import { Receipt, Plus, Trash2, Calendar, Euro, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useGastosMaterial, GastoMaterialInsert } from '@/hooks/useGastosMaterial';

const CATEGORIAS = ['Pantallas', 'Baterías', 'Repuestos', 'Herramientas', 'Otros'];

const months = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const GastoMaterial = () => {
  const { gastos, isLoading, addGasto, deleteGasto } = useGastosMaterial();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  const [formData, setFormData] = useState<GastoMaterialInsert>({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    concepto: '',
    categoria: '',
    coste: 0,
    notas: '',
  });

  // Gasto total histórico (todos los meses)
  const gastoHistoricoTotal = useMemo(() => {
    return gastos.reduce((total, gasto) => total + Number(gasto.coste), 0);
  }, [gastos]);

  // Gastos filtrados por mes/año seleccionado
  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter((gasto) => {
        const gastoDate = parseISO(gasto.fecha);
        return (
          gastoDate.getMonth() + 1 === selectedMonth &&
          gastoDate.getFullYear() === selectedYear
        );
      })
      .sort((a, b) => {
        const dateA = parseISO(a.fecha).getTime();
        const dateB = parseISO(b.fecha).getTime();
        return dateB - dateA;
      });
  }, [gastos, selectedMonth, selectedYear]);

  // Gasto del mes seleccionado
  const gastoMesSeleccionado = useMemo(() => {
    return gastosFiltrados.reduce((total, gasto) => total + Number(gasto.coste), 0);
  }, [gastosFiltrados]);

  const getSelectedMonthName = () => {
    const month = months.find(m => m.value === selectedMonth);
    return month ? month.label : '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || !formData.categoria || formData.coste <= 0) {
      return;
    }
    addGasto.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          fecha: format(new Date(), 'yyyy-MM-dd'),
          concepto: '',
          categoria: '',
          coste: 0,
          notas: '',
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteGasto.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Receipt className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Gasto en Material
              </h1>
              <p className="text-sm text-muted-foreground">
                Registra y gestiona tus gastos en materiales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Month/Year Selector */}
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo gasto en material</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData({ ...formData, fecha: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto">Concepto</Label>
                    <Input
                      id="concepto"
                      placeholder="Ej: Pantalla iPhone 12"
                      value={formData.concepto}
                      onChange={(e) =>
                        setFormData({ ...formData, concepto: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoria: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coste">Coste (€)</Label>
                    <Input
                      id="coste"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.coste || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coste: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas (opcional)</Label>
                    <Textarea
                      id="notas"
                      placeholder="Notas adicionales..."
                      value={formData.notas || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, notas: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addGasto.isPending}
                  >
                    {addGasto.isPending ? 'Guardando...' : 'Guardar gasto'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Gasto total histórico */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gasto total histórico
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {gastoHistoricoTotal.toFixed(2)} €
              </div>
              <p className="text-xs text-muted-foreground">
                Suma de todos los gastos registrados
              </p>
            </CardContent>
          </Card>

          {/* Gasto del mes seleccionado */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gasto del mes seleccionado
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {gastoMesSeleccionado.toFixed(2)} €
              </div>
              <p className="text-xs text-muted-foreground">
                {getSelectedMonthName()} {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de gastos - {getSelectedMonthName()} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando gastos...
              </div>
            ) : gastosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay gastos registrados en este mes.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Coste (€)</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastosFiltrados.map((gasto) => (
                      <TableRow key={gasto.id}>
                        <TableCell>
                          {format(parseISO(gasto.fecha), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {gasto.concepto}
                        </TableCell>
                        <TableCell>{gasto.categoria}</TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(gasto.coste).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar gasto?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará
                                  permanentemente el gasto "{gasto.concepto}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(gasto.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
      </div>
    </div>
  );
};

export default GastoMaterial;
