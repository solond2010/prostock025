import { useState, useMemo, useEffect, useRef } from 'react';
import { CurrentStockSummary, StockItem } from '@/types/stock';
import { DollarSign, TrendingUp, Package, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SummaryDetailModal } from './SummaryDetailModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { differenceInDays } from 'date-fns';

interface SummaryCardsProps {
  currentSummary: CurrentStockSummary;
  stockItems: StockItem[];
}

const fmt = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

type ModalType = 'invested' | 'revenue' | 'profit' | 'margin';

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + diff * ease));
      if (p < 1) requestAnimationFrame(tick);
      else { setValue(target); prev.current = target; }
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// ── Sparkline mini SVG ─────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60, h = 22;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lastPt = pts.split(' ').pop() ?? '';
  const [lx, ly] = lastPt.split(',');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}

export function SummaryCards({ currentSummary, stockItems }: SummaryCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('invested');

  const handleCardClick = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  // ── Month stats ────────────────────────────────────────────────────────────
  const monthStats = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const sold = stockItems.filter(i => {
      if (i.estado !== 'Vendido' || !i.fecha_venta) return false;
      const d = new Date(i.fecha_venta);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });
    const ben = sold.reduce((s, i) => {
      const c = Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion);
      return s + (Number(i.precio_venta_real) - c);
    }, 0);
    const parados = stockItems.filter(i => {
      if (i.estado !== 'En stock' || !i.purchase_date) return false;
      return differenceInDays(now, new Date(i.purchase_date)) >= 21;
    }).length;

    // Sparkline: last 6 months benefit
    const sparkBen: number[] = [];
    for (let m = 5; m >= 0; m--) {
      const t = new Date(cy, cm - m, 1);
      const tm = t.getMonth(), ty = t.getFullYear();
      const ms = stockItems.filter(i => {
        if (i.estado !== 'Vendido' || !i.fecha_venta) return false;
        const d = new Date(i.fecha_venta);
        return d.getMonth() === tm && d.getFullYear() === ty;
      });
      sparkBen.push(ms.reduce((s, i) => {
        const c = Number(i.purchase_price_per_unit) + Number(i.precio_envio) + Number(i.coste_reparacion);
        return s + (Number(i.precio_venta_real) - c);
      }, 0));
    }

    return { ben, count: sold.length, parados, sparkBen };
  }, [stockItems]);

  // Animated values
  const animInvested = useCountUp(currentSummary.totalInvestedCurrent);
  const animRevenue  = useCountUp(currentSummary.expectedRevenueCurrent);
  const animProfit   = useCountUp(currentSummary.possibleProfitCurrent);
  const animMonthBen = useCountUp(monthStats.ben);

  const inStock = stockItems.filter(i => i.estado === 'En stock').length;
  const margin  = currentSummary.possibleMarginCurrent;

  const cards = [
    {
      type: 'invested' as ModalType,
      title: 'Capital en stock',
      subtitle: 'Lo que tienes invertido ahora mismo',
      value: fmt(animInvested),
      sub: `${inStock} producto${inStock !== 1 ? 's' : ''} activos`,
      icon: Package,
      accent: 'hsl(262 73% 58%)',
      accentBg: 'hsl(262 73% 58% / 0.1)',
      trend: null as 'up' | 'down' | null,
      delay: 'animate-slide-up-1',
    },
    {
      type: 'profit' as ModalType,
      title: 'Si vendes todo',
      subtitle: 'Beneficio posible vendiendo al precio esperado',
      value: fmt(animProfit),
      sub: `${margin.toFixed(1)}% de margen`,
      icon: TrendingUp,
      accent: animProfit >= 0 ? 'hsl(160 84% 38%)' : 'hsl(0 72% 51%)',
      accentBg: animProfit >= 0 ? 'hsl(160 84% 38% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (animProfit > 0 ? 'up' : animProfit < 0 ? 'down' : null) as 'up' | 'down' | null,
      delay: 'animate-slide-up-2',
    },
    {
      type: 'margin' as ModalType,
      title: 'Beneficio del mes',
      subtitle: 'Ganancia real de ventas este mes',
      value: (animMonthBen >= 0 ? '+' : '') + fmt(animMonthBen),
      sub: `${monthStats.count} venta${monthStats.count !== 1 ? 's' : ''} este mes`,
      icon: Trophy,
      accent: animMonthBen >= 0 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)',
      accentBg: animMonthBen >= 0 ? 'hsl(38 92% 50% / 0.1)' : 'hsl(0 72% 51% / 0.1)',
      trend: (animMonthBen > 0 ? 'up' : animMonthBen < 0 ? 'down' : null) as 'up' | 'down' | null,
      sparkline: monthStats.sparkBen,
      delay: 'animate-slide-up-3',
    },
    {
      type: 'revenue' as ModalType,
      title: 'Ingresos esperados',
      subtitle: 'Precio de venta total si vendes todo el stock',
      value: fmt(animRevenue),
      sub: monthStats.parados > 0 ? `⚠️ ${monthStats.parados} parado${monthStats.parados !== 1 ? 's' : ''} 21+d` : '✓ Todo en circulación',
      icon: DollarSign,
      accent: 'hsl(217 91% 60%)',
      accentBg: 'hsl(217 91% 60% / 0.1)',
      trend: null as 'up' | 'down' | null,
      delay: 'animate-slide-up-4',
    },
  ];

  return (
    <TooltipProvider>
      <>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map((card) => (
            <Tooltip key={card.type}>
              <TooltipTrigger asChild>
                <div
                  className={`kpi-card ${card.delay}`}
                  onClick={() => handleCardClick(card.type)}
                >
                  {/* Accent top bar */}
                  <div className="h-[3px] w-full rounded-t-xl" style={{ background: card.accent }} />

                  <div className="p-3 sm:p-4 lg:p-5">
                    {/* Icon + trend */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                        style={{ background: card.accentBg }}
                      >
                        <card.icon className="h-[18px] w-[18px]" style={{ color: card.accent }} />
                      </div>
                      {card.trend === 'up' && (
                        <ArrowUpRight className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      )}
                      {card.trend === 'down' && (
                        <ArrowDownRight className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      )}
                    </div>

                    {/* Label */}
                    <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-snug mb-1">
                      {card.title}
                    </p>

                    {/* Big number */}
                    <p className="stat-number text-xl sm:text-2xl lg:text-[1.55rem] leading-tight tabular-nums"
                      style={{ color: card.accent }}>
                      {card.value}
                    </p>

                    {/* Sub + sparkline */}
                    <div className="flex items-end justify-between mt-2 gap-2">
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-snug">{card.sub}</p>
                      {'sparkline' in card && card.sparkline && (
                        <Sparkline data={card.sparkline} color={card.accent} />
                      )}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="hidden lg:block max-w-[200px] text-center text-xs">
                <p>{card.subtitle}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <SummaryDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          type={modalType}
          stockItems={stockItems}
        />
      </>
    </TooltipProvider>
  );
}
