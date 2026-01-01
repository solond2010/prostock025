import { useState } from 'react';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StockItemWithCalculations } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Wallet, 
  DollarSign,
  Clock
} from 'lucide-react';

interface ProductNameTooltipProps {
  item: StockItemWithCalculations;
  onClick: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

const getDaysInStock = (purchaseDate: string | null | undefined, estado: string): number | null => {
  if (estado !== 'En stock' || !purchaseDate) return null;
  const days = differenceInDays(new Date(), new Date(purchaseDate));
  return Math.max(0, days);
};

const getDaysVariantClasses = (days: number | null): string => {
  if (days === null) return '';
  if (days <= 10) return 'bg-success/15 text-success border-success/30';
  if (days <= 20) return 'bg-warning/15 text-warning border-warning/30';
  return 'bg-destructive/15 text-destructive border-destructive/30';
};

export function ProductNameTooltip({ item, onClick }: ProductNameTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [verticalPosition, setVerticalPosition] = useState<'bottom' | 'top'>('bottom');

  const daysInStock = getDaysInStock(item.purchase_date, item.estado);
  const isVendido = item.estado === 'Vendido';

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check horizontal position
    if (rect.right + 320 > viewportWidth) {
      setPosition('left');
    } else {
      setPosition('right');
    }
    
    // Check vertical position
    if (rect.bottom + 300 > viewportHeight) {
      setVerticalPosition('top');
    } else {
      setVerticalPosition('bottom');
    }
    
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="font-medium text-primary hover:text-primary/80 text-left transition-all duration-200 hover:underline hover:decoration-primary/50 hover:underline-offset-2 cursor-pointer"
      >
        {item.name}
      </button>
      
      {/* Tooltip - Hidden on mobile */}
      <div
        className={`
          absolute z-50 hidden md:block
          ${position === 'right' ? 'left-full ml-3' : 'right-full mr-3'}
          ${verticalPosition === 'bottom' ? 'top-0' : 'bottom-0'}
          w-[280px] p-4
          bg-popover/95 backdrop-blur-xl
          border border-border/60 rounded-xl
          shadow-xl shadow-black/20
          transition-all duration-200 ease-out
          ${isVisible 
            ? 'opacity-100 translate-x-0 pointer-events-auto' 
            : 'opacity-0 pointer-events-none ' + (position === 'right' ? '-translate-x-2' : 'translate-x-2')
          }
        `}
      >
        {/* Arrow */}
        <div 
          className={`
            absolute w-2 h-2 bg-popover/95 border-border/60 rotate-45
            ${position === 'right' 
              ? 'left-0 -translate-x-1/2 border-l border-b' 
              : 'right-0 translate-x-1/2 border-r border-t'
            }
            ${verticalPosition === 'bottom' ? 'top-4' : 'bottom-4'}
          `}
        />
        
        {/* Header */}
        <div className="mb-3 pb-3 border-b border-border/40">
          <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {item.name}
          </h4>
        </div>
        
        {/* Content */}
        <div className="space-y-2.5 text-xs">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Estado
            </span>
            <Badge 
              variant={isVendido ? 'default' : 'secondary'}
              className={`text-xs ${isVendido ? 'bg-success text-success-foreground' : ''}`}
            >
              {item.estado}
            </Badge>
          </div>
          
          {/* Categoría */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Categoría
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {item.category}
            </Badge>
          </div>
          
          {/* Días en stock (solo si en stock) */}
          {!isVendido && daysInStock !== null && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Días en stock
              </span>
              <Badge 
                variant="outline"
                className={`text-xs font-medium ${getDaysVariantClasses(daysInStock)}`}
              >
                {daysInStock} días
              </Badge>
            </div>
          )}
          
          {/* Separator */}
          <div className="border-t border-border/30 my-2" />
          
          {/* Coste total */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              Coste total
            </span>
            <span className="font-medium text-foreground">
              {formatCurrency(item.coste_total)}
            </span>
          </div>
          
          {/* Precio esperado o real */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              {isVendido ? 'Precio venta' : 'Precio esperado'}
            </span>
            <span className="font-medium text-foreground">
              {isVendido 
                ? formatCurrency(item.precio_venta_real || 0)
                : formatCurrency(item.sale_price_per_unit || 0)
              }
            </span>
          </div>
          
          {/* Beneficio */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              {isVendido ? 'Beneficio real' : 'Beneficio esperado'}
            </span>
            <span className={`font-semibold ${
              (isVendido ? item.beneficio_real : item.beneficio_esperado) !== null &&
              (isVendido ? item.beneficio_real! : item.beneficio_esperado!) >= 0
                ? 'text-success'
                : 'text-destructive'
            }`}>
              {isVendido 
                ? (item.beneficio_real !== null ? formatCurrency(item.beneficio_real) : '-')
                : (item.beneficio_esperado !== null ? formatCurrency(item.beneficio_esperado) : '-')
              }
            </span>
          </div>
          
          {/* Datos adicionales si vendido */}
          {isVendido && item.fecha_venta && (
            <>
              <div className="border-t border-border/30 my-2" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Fecha de venta
                </span>
                <span className="font-medium text-foreground">
                  {format(new Date(item.fecha_venta), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
