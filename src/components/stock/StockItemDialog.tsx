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
import { Checkbox } from '@/components/ui/checkbox';
import { StockItem, StockItemFormData } from '@/types/stock';
import { TrendingUp, TrendingDown, Calculator } from 'lucide-react';

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const REPAIR_OPTIONS = [
  'Pantalla',
  'Parte trasera',
  'Cámara',
  'Face ID',
  'Batería',
  'Carga',
  'Todo bien',
  'Otros',
];
const COLOR_OPTIONS = [
  'Negro',
  'Blanco',
  'Gris',
  'Plata',
  'Dorado',
  'Azul',
  'Verde',
  'Rojo',
  'Morado',
  'Rosa',
  'Amarillo',
  'Naranja',
];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  category: z.string().min(1, 'La categoría es obligatoria').max(50),
  purchase_date: z.string().min(1, 'La fecha de compra es obligatoria'),
  purchase_price_per_unit: z.coerce.number().min(0, 'Debe ser 0 o más'),
  sale_price_per_unit: z.coerce.number().min(0, 'Debe ser 0 o más'),
  notes: z.string().max(500).optional(),
  estado: z.enum(['En stock', 'Vendido']),
  precio_envio: z.coerce.number().min(0, 'Debe ser 0 o más'),
  coste_reparacion: z.coerce.number().min(0, 'Debe ser 0 o más'),
  fecha_venta: z.string().optional(),
  precio_venta_real: z.coerce.number().min(0, 'Debe ser 0 o más'),
  // Campos de telefonía
  almacenamiento: z.string().optional(),
  bateria_porcentaje: z.coerce.number().int().min(0).max(100).nullable().optional(),
  reparaciones: z.array(z.string()).optional(),
  color: z.string().optional(),
  // Campos de ropa
  talla: z.string().optional(),
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
      purchase_price_per_unit: 0,
      sale_price_per_unit: 0,
      notes: '',
      estado: 'En stock',
      precio_envio: 0,
      coste_reparacion: 0,
      fecha_venta: '',
      precio_venta_real: 0,
      almacenamiento: '',
      bateria_porcentaje: null,
      reparaciones: [],
      color: '',
      talla: '',
    },
  });

  const watchEstado = form.watch('estado');
  const watchCategory = form.watch('category');
  const isTelefonia = watchCategory === 'Telefonía';
  const isRopa = watchCategory === 'Ropa';
  const isReparacion = watchCategory === 'Reparación';

  // Live profit calculator
  const watchPurchase = form.watch('purchase_price_per_unit');
  const watchSale = form.watch('sale_price_per_unit');
  const watchSaleReal = form.watch('precio_venta_real');
  const watchEnvio = form.watch('precio_envio');
  const watchReparacion = form.watch('coste_reparacion');

  const liveCoste = Number(watchPurchase || 0) + Number(watchEnvio || 0) + Number(watchReparacion || 0);
  const referencePrice = watchEstado === 'Vendido' ? Number(watchSaleReal || 0) : Number(watchSale || 0);
  const liveBeneficio = referencePrice - liveCoste;
  const liveMargen = liveCoste > 0 ? (liveBeneficio / liveCoste) * 100 : 0;
  const showCalculator = !isReparacion && liveCoste > 0;

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          category: item.category,
          purchase_date: item.purchase_date,
          purchase_price_per_unit: item.purchase_price_per_unit,
          sale_price_per_unit: item.sale_price_per_unit,
          notes: item.notes || '',
          estado: item.estado,
          precio_envio: item.precio_envio,
          coste_reparacion: item.coste_reparacion,
          fecha_venta: item.fecha_venta || '',
          precio_venta_real: item.precio_venta_real,
          almacenamiento: item.almacenamiento || '',
          bateria_porcentaje: item.bateria_porcentaje,
          reparaciones: item.reparaciones || [],
          color: item.color || '',
          talla: item.talla || '',
        });
      } else {
        form.reset({
          name: '',
          category: '',
          purchase_date: new Date().toISOString().split('T')[0],
          purchase_price_per_unit: 0,
          sale_price_per_unit: 0,
          notes: '',
          estado: 'En stock',
          precio_envio: 0,
          coste_reparacion: 0,
          fecha_venta: '',
          precio_venta_real: 0,
          almacenamiento: '',
          bateria_porcentaje: null,
          reparaciones: [],
          color: '',
          talla: '',
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Telefonía">Telefonía</SelectItem>
                        <SelectItem value="Ropa">Ropa</SelectItem>
                        <SelectItem value="Reparación">Reparación</SelectItem>
                        <SelectItem value="Perfumes">Perfumes</SelectItem>
                        <SelectItem value="Electrónica">Electrónica</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
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

            {/* Campos específicos de Telefonía */}
            {isTelefonia && (
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">Detalles del Dispositivo</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="almacenamiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Almacenamiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STORAGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bateria_porcentaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% Batería</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val === '' ? null : Number(val));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reparaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reparaciones necesarias</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {REPAIR_OPTIONS.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={field.value?.includes(option) || false}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, option]);
                                } else {
                                  field.onChange(current.filter((v) => v !== option));
                                }
                              }}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Campos específicos de Ropa */}
            {isRopa && (
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">Detalles de Ropa</p>
                <FormField
                  control={form.control}
                  name="talla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Talla</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona talla" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Campos específicos de Reparación */}
            {isReparacion && (
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-muted-foreground">Detalles de Reparación</p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="purchase_price_per_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio Compra Pieza</FormLabel>
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
                        <FormLabel>Precio Venta Reparación</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Fecha de compra */}
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

            {/* Campos de precios - ocultar para Reparación */}
            {!isReparacion && (
              <>
                <div className="grid grid-cols-2 gap-3">
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
              </>
            )}

            {/* Campos de venta - ocultar para Reparación */}
            {!isReparacion && watchEstado === 'Vendido' && (
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

            {/* ── Live profit calculator ─────────────────────────────── */}
            {showCalculator && (
              <div className={`rounded-xl border p-3 transition-all ${
                liveBeneficio >= 0
                  ? 'border-success/30 bg-success/5'
                  : 'border-destructive/30 bg-destructive/5'
              }`}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Calculadora en directo
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Coste total</p>
                    <p className="text-base font-bold">{liveCoste.toFixed(0)}€</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      {watchEstado === 'Vendido' ? 'Beneficio real' : 'Beneficio esp.'}
                    </p>
                    <p className={`text-base font-bold ${liveBeneficio >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {liveBeneficio >= 0 ? '+' : ''}{liveBeneficio.toFixed(0)}€
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Margen</p>
                    <div className={`flex items-center justify-center gap-0.5 text-base font-bold ${liveMargen >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {liveMargen >= 0
                        ? <TrendingUp className="h-3.5 w-3.5" />
                        : <TrendingDown className="h-3.5 w-3.5" />}
                      {liveMargen.toFixed(1)}%
                    </div>
                  </div>
                </div>
                {/* Margen visual bar */}
                {referencePrice > 0 && (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          liveMargen >= 30 ? 'bg-success' :
                          liveMargen >= 15 ? 'bg-amber-500' :
                          liveMargen >= 0 ? 'bg-orange-500' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min(Math.max(liveMargen, 0), 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                      <span>0%</span>
                      <span className={liveMargen >= 30 ? 'text-success font-medium' : ''}>30% objetivo</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
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
              <Button type="submit" disabled={isLoading} className="btn-primary-gradient text-white">
                {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Añadir'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
