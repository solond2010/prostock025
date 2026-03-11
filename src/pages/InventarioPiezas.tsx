import { useState } from 'react';
import { useRepuestos, Repuesto } from '@/hooks/useRepuestos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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
import { Plus, Trash2, Search, Wrench, Loader2 } from 'lucide-react';

const MARCAS = ['Apple'];

const DISPOSITIVOS: Record<string, string[]> = {
  Apple: ['iPhone', 'iPad', 'MacBook'],
};

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

  // Form state
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

  const resetForm = () => {
    setNombre('');
    setMarca('Apple');
    setDispositivo('');
    setModelo('');
    setCantidad(1);
    setNotas('');
  };

  const handleAdd = () => {
    if (!nombre.trim()) return;
    addRepuesto.mutate(
      {
        nombre: nombre.trim(),
        marca,
        dispositivo: dispositivo || undefined,
        modelo: modelo || undefined,
        cantidad,
        notas: notas.trim() || undefined,
      },
      { onSuccess: () => { setDialogOpen(false); resetForm(); } }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteRepuesto.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventario de Piezas</h1>
            <p className="text-sm text-muted-foreground">Repuestos disponibles en oficina</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Añadir pieza
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pieza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="w-24 text-center">Cantidad</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-20 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'Sin resultados' : 'No hay piezas registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r: Repuesto) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    <TableCell>{r.marca}</TableCell>
                    <TableCell>{r.dispositivo || '—'}</TableCell>
                    <TableCell>{r.modelo || '—'}</TableCell>
                    <TableCell className="text-center">{r.cantidad}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.notas || '—'}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir pieza</DialogTitle>
            <DialogDescription>Registra un nuevo repuesto en el inventario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Pantalla, Batería, Conector de carga..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select value={marca} onValueChange={setMarca}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARCAS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dispositivo</Label>
                <Select
                  value={dispositivo}
                  onValueChange={(val) => { setDispositivo(val); setModelo(''); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(DISPOSITIVOS[marca] || []).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {modelos && (
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select value={modelo} onValueChange={setModelo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modelo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Notas opcionales..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
