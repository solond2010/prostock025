import { useState } from 'react';
import { useRepuestos, Repuesto } from '@/hooks/useRepuestos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Search, Wrench, Loader2, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const MARCAS = ['Apple'];
const DISPOSITIVOS: Record<string, string[]> = { Apple: ['iPhone', 'iPad', 'MacBook'] };
const MODELOS_IPHONE = [
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
  'iPhone 12 mini', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
  'iPhone 13 mini', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
  'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
  'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  'iPhone 16e',
];

function getModelos(dispositivo: string): string[] | null {
  if (dispositivo === 'iPhone') return MODELOS_IPHONE;
  return null;
}

export default function InventarioPiezas() {
  const { data: repuestos = [], isLoading, addRepuesto, deleteRepuesto } = useRepuestos();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('Apple');
  const [dispositivo, setDispositivo] = useState('');
  const [modelo, setModelo] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const modelos = dispositivo ? getModelos(dispositivo) : null;

  const filtered = repuestos.filter((r: Repuesto) =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.modelo?.toLowerCase().includes(search.toLowerCase()) ||
    r.dispositivo?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setNombre(''); setMarca('Apple'); setDispositivo(''); setModelo(''); setCantidad(1); setNotas(''); };

  const handleAdd = () => {
    if (!nombre.trim()) return;
    addRepuesto.mutate(
      { nombre: nombre.trim(), marca, dispositivo: dispositivo || undefined, modelo: modelo || undefined, cantidad, notas: notas.trim() || undefined },
      { onSuccess: () => { setDialogOpen(false); resetForm(); } }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteRepuesto.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-6">

      <PageHeader
        icon={Wrench}
        title="Inventario de Piezas"
        subtitle="Repuestos disponibles en oficina"
        iconColor="cyan"
        badge={
          repuestos.length > 0 ? (
            <Badge variant="outline" className="text-[10px] font-bold">{repuestos.length} piezas</Badge>
          ) : undefined
        }
        actions={
          <Button className="btn-primary-gradient h-9 text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Añadir pieza
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm animate-slide-up-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, modelo o dispositivo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden animate-slide-up-2">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/20" style={{ borderTop: '3px solid hsl(188,84%,40%)' }}>
          <Package className="h-4 w-4" style={{ color: 'hsl(188,84%,40%)' }} />
          <span className="text-sm font-semibold">Stock de repuestos</span>
          {filtered.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
            <Wrench className="h-10 w-10 mb-3 opacity-15" />
            <p className="text-sm">{search ? 'Sin resultados para tu búsqueda' : 'No hay piezas registradas'}</p>
            {!search && <p className="text-xs mt-1 opacity-60">Añade la primera pieza con el botón de arriba</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border/40 bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Marca</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dispositivo</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modelo</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Cantidad</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notas</th>
                  <th className="w-14" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: Repuesto) => (
                  <tr key={r.id} className="table-row-premium">
                    <td className="px-4 py-3 font-medium">{r.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border border-border/50 bg-muted/40 text-muted-foreground">
                        {r.marca}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.dispositivo || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.modelo || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-lg text-xs font-bold"
                        style={{
                          background: r.cantidad > 0 ? 'hsl(188 84% 40% / 0.12)' : 'hsl(var(--destructive)/0.1)',
                          color: r.cantidad > 0 ? 'hsl(188,84%,40%)' : 'hsl(var(--destructive))',
                        }}
                      >
                        {r.cantidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.notas || '—'}</td>
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors mx-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir pieza</DialogTitle>
            <DialogDescription>Registra un nuevo repuesto en el inventario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Pantalla, Batería, Conector de carga..." value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Marca</Label>
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MARCAS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Dispositivo</Label>
                <Select value={dispositivo} onValueChange={v => { setDispositivo(v); setModelo(''); }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{(DISPOSITIVOS[marca] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {modelos && (
              <div className="space-y-1.5">
                <Label>Modelo</Label>
                <Select value={modelo} onValueChange={setModelo}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar modelo..." /></SelectTrigger>
                  <SelectContent>{modelos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Cantidad</Label>
              <Input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value) || 1)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea placeholder="Notas opcionales..." value={notas} onChange={e => setNotas(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!nombre.trim() || addRepuesto.isPending}>
              {addRepuesto.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Añadir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta pieza?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
