import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StockItem, StockItemFormData } from '@/types/stock';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required').max(50),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  units_in_stock: z.coerce.number().int().min(0, 'Must be 0 or more'),
  purchase_price_per_unit: z.coerce.number().min(0, 'Must be 0 or more'),
  sale_price_per_unit: z.coerce.number().min(0, 'Must be 0 or more'),
  notes: z.string().max(500).optional(),
  estado: z.enum(['En stock', 'Vendido']),
  precio_envio: z.coerce.number().min(0, 'Must be 0 or more'),
  coste_reparacion: z.coerce.number().min(0, 'Must be 0 or more'),
  fecha_venta: z.string().optional(),
  precio_venta_real: z.coerce.number().min(0, 'Must be 0 or more'),
});

interface StockItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItem | null;
  onSubmit: (data: StockItemFormData) => void;
  isLoading: boolean;
}

export function StockItemDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading,
}: StockItemDialogProps) {
  const form = useForm<StockItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      purchase_date: new Date().toISOString().split('T')[0],
      units_in_stock: 0,
      purchase_price_per_unit: 0,
      sale_price_per_unit: 0,
      notes: '',
      estado: 'En stock',
      precio_envio: 0,
      coste_reparacion: 0,
      fecha_venta: '',
      precio_venta_real: 0,
    },
  });

  const watchEstado = form.watch('estado');

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          category: item.category,
          purchase_date: item.purchase_date,
          units_in_stock: item.units_in_stock,
          purchase_price_per_unit: item.purchase_price_per_unit,
          sale_price_per_unit: item.sale_price_per_unit,
          notes: item.notes || '',
          estado: item.estado,
          precio_envio: item.precio_envio,
          coste_reparacion: item.coste_reparacion,
          fecha_venta: item.fecha_venta || '',
          precio_venta_real: item.precio_venta_real,
        });
      } else {
        form.reset({
          name: '',
          category: '',
          purchase_date: new Date().toISOString().split('T')[0],
          units_in_stock: 0,
          purchase_price_per_unit: 0,
          sale_price_per_unit: 0,
          notes: '',
          estado: 'En stock',
          precio_envio: 0,
          coste_reparacion: 0,
          fecha_venta: '',
          precio_venta_real: 0,
        });
      }
    }
  }, [open, item, form]);

  const handleSubmit = (data: StockItemFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduce el nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce la categoría" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En stock">En stock</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Compra</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="units_in_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidades</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Compra</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Venta Esperado</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="precio_envio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Envío</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coste_reparacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coste de Reparación</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {watchEstado === 'Vendido' && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fecha_venta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Venta</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precio_venta_real"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Venta Real</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Añadir'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
