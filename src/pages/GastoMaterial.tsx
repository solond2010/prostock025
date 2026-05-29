import { useState, useMemo } from 'react';
import { Receipt, Plus, Trash2, Calendar, History, Euro } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
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
import { PageHeader } from '@/components/ui/PageHeader';
import { useGastosMaterial, GastoMaterialInsert } from '@/hooks/useGastosMaterial';

const CATEGORIAS = ['Pantallas', 'Baterías', 'Repuestos', 'Herramientas', 'Otros'];

const MESES = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

const fmtEur = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);

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

  const gastoHistoricoTotal = useMemo(() => gastos.reduce((t, g) => t + Number(g.coste), 0), [gastos]);

  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter(g => {
        const d = parseISO(g.fecha);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime());
  }, [gastos, selectedMonth, selectedYear]);

  const gastoMes = useMemo(() => gastosFiltrados.reduce((t, g) => t + Number(g.coste), 0), [gastosFiltrados]);

  const mesNombre = MESES.find(m => m.value === selectedMonth)?.label ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concepto || !formData.categoria || formData.coste <= 0) return;
    addGasto.mutate(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({ fecha: format(new Date(), 'yyyy-MM-dd'), concepto: '', categoria: '', coste: 0, notas: '' });
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={Receipt}
        title="Gasto en Material"
        subtitle="Registra y gestiona tus gastos en materiales de reparación"
        iconColor="amber"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="h-9 w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MESES.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="h-9 w-[95px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary-gradient h-9 text-white">
                  <Plus className="h-4 w-4 mr-1.5" /> Añadir gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nuevo gasto en material</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Fecha</Label>
                    <Input type="date" value={formData.fecha} onChange={e => setFormData({ ...formData, fecha: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Concepto</Label>
                    <Input placeholder="Ej: Pantalla iPhone 12" value={formData.concepto} onChange={e => setFormData({ ...formData, concepto: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Categoría</Label>
                    <Select value={formData.categoria} onValueChange={v => setFormData({ ...formData, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Coste (€)</Label>
                    <Input type="number" step="0.01" min="0" placeholder="0.00"
                      value={formData.coste || ''}
                      onChange={e => setFormData({ ...formData, coste: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notas (opcional)</Label>
                    <Textarea placeholder="Notas adicionales..." value={formData.notas || ''} onChange={e => setFormData({ ...formData, notas: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full btn-primary-gradient text-white" disabled={addGasto.isPending}>
                    {addGasto.isPending ? 'Guardando...' : 'Guardar gasto'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up-1">
        <div className="kpi-card p-4" style={{ borderTop: '3px solid hsl(var(--destructive))' }}>
          <div className="flex items-center gap-2 mb-2">
            <History className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground font-medium">Gasto histórico total</span>
          </div>
          <p className="text-2xl font-bold text-destructive leading-none">{fmtEur(gastoHistoricoTotal)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Suma de todos los gastos registrados</p>
        </div>
        <div className="kpi-card p-4" style={{ borderTop: '3px solid hsl(38,92%,46%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-3.5 w-3.5" style={{ color: 'hsl(38,92%,46%)' }} />
            <span className="text-xs text-muted-foreground font-medium">Gasto del mes</span>
          </div>
          <p className="text-2xl font-bold leading-none" style={{ color: 'hsl(38,92%,46%)' }}>{fmtEur(gastoMes)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{mesNombre} {selectedYear}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden animate-slide-up-2">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Historial — {mesNombre} {selectedYear}</span>
          {gastosFiltrados.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{gastosFiltrados.length} gasto{gastosFiltrados.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando gastos...</div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
            <Receipt className="h-10 w-10 mb-3 opacity-15" />
            <p className="text-sm">No hay gastos en este mes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Concepto</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Categoría</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Coste</th>
                  <th className="w-[52px]" />
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map(g => (
                  <tr key={g.id} className="table-row-premium">
                    <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                      {format(parseISO(g.fecha), 'dd/MM/yy', { locale: es })}
                    </td>
                    <td className="px-4 py-3 font-medium">{g.concepto}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border border-border/50 bg-muted/40 text-muted-foreground">
                        {g.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-destructive tabular-nums">
                      {fmtEur(Number(g.coste))}
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
                            <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente "{g.concepto}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteGasto.mutate(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GastoMaterial;
