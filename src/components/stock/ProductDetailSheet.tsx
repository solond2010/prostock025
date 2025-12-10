import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StockItemWithCalculations } from '@/types/stock';
import { Pencil, Trash2, Calendar, Package, TrendingUp, Smartphone } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductDetailSheetProps {
  item: StockItemWithCalculations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: StockItemWithCalculations) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export function ProductDetailSheet({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailSheetProps) {
  if (!item) return null;

  const isVendido = item.estado === 'Vendido';
  
  // Calculate days
  const today = new Date();
  const purchaseDate = item.purchase_date ? parseISO(item.purchase_date) : null;
  const saleDate = item.fecha_venta ? parseISO(item.fecha_venta) : null;
  
  const diasEnStock = purchaseDate ? differenceInDays(today, purchaseDate) : null;
  const diasHastaVenta = purchaseDate && saleDate ? differenceInDays(saleDate, purchaseDate) : null;

  // Price difference
  const diferenciaVenta = isVendido
    ? item.precio_venta_real - (item.sale_price_per_unit * item.units_in_stock)
    : null;

  const handleEdit = () => {
    onEdit(item);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(item.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-4">
          {/* Cabecera */}
          <div className="space-y-3">
            <SheetTitle className="text-xl">{item.name}</SheetTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isVendido ? 'default' : 'secondary'}
                className={isVendido ? 'bg-success text-success-foreground' : ''}
              >
                {item.estado}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {item.category}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Resumen */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Resumen
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Coste Total</p>
                <p className="text-lg font-semibold">{formatCurrency(item.coste_total)}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Beneficio Esperado</p>
                <p className={`text-lg font-semibold ${item.beneficio_esperado >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(item.beneficio_esperado)}
                </p>
              </div>
              {isVendido && item.beneficio_real !== null && (
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Beneficio Real</p>
                  <p className={`text-lg font-semibold ${item.beneficio_real >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(item.beneficio_real)}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">
                  {isVendido ? 'Días hasta la venta' : 'Días en stock'}
                </p>
                <p className="text-lg font-semibold">
                  {isVendido ? (diasHastaVenta ?? '-') : (diasEnStock ?? '-')}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Detalle de Compra */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Package className="h-4 w-4" />
              Detalle de Compra
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de compra</span>
                <span className="font-medium">{formatDate(item.purchase_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unidades</span>
                <span className="font-medium">{item.units_in_stock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio compra (ud.)</span>
                <span className="font-medium">{formatCurrency(item.purchase_price_per_unit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio de envío</span>
                <span className="font-medium">{formatCurrency(item.precio_envio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coste de reparación</span>
                <span className="font-medium">{formatCurrency(item.coste_reparacion)}</span>
              </div>
              {item.notes && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{item.notes}</p>
                </div>
              )}
            </div>
          </section>

          {/* Detalles del Dispositivo (solo para Telefonía) */}
          {item.category === 'Telefonía' && (item.almacenamiento || item.bateria_porcentaje !== null || (item.reparaciones && item.reparaciones.length > 0)) && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  Detalles del Dispositivo
                </h3>
                <div className="space-y-2 text-sm">
                  {item.almacenamiento && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Almacenamiento</span>
                      <span className="font-medium">{item.almacenamiento}</span>
                    </div>
                  )}
                  {item.bateria_porcentaje !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Porcentaje de batería</span>
                      <span className="font-medium">{item.bateria_porcentaje}%</span>
                    </div>
                  )}
                  {item.reparaciones && item.reparaciones.length > 0 && (
                    <div className="mt-2">
                      <p className="text-muted-foreground mb-2">Reparaciones necesarias</p>
                      <div className="flex flex-wrap gap-1">
                        {item.reparaciones.map((rep) => (
                          <Badge key={rep} variant="outline" className="text-xs">
                            {rep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Detalle de Venta (solo si está vendido) */}
          {isVendido && (
            <>
              <Separator />
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Detalle de Venta
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de venta</span>
                    <span className="font-medium">{formatDate(item.fecha_venta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio venta esperado</span>
                    <span className="font-medium">
                      {formatCurrency(item.sale_price_per_unit * item.units_in_stock)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio venta real</span>
                    <span className="font-medium">{formatCurrency(item.precio_venta_real)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diferencia</span>
                    <span className={`font-medium ${diferenciaVenta && diferenciaVenta >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {diferenciaVenta !== null ? formatCurrency(diferenciaVenta) : '-'}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Acciones */}
          <div className="flex gap-3">
            <Button onClick={handleEdit} className="flex-1">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
