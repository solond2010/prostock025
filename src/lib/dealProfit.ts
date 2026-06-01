import { detectModel, looksBroken, refSalePrice, refRepairCost } from './iphoneModels';
import { StockItem } from '@/types/stock';

export interface DealProfit {
  model: string;
  broken: boolean;
  buyPrice: number;
  saleEst: number;
  saleSource: 'historial' | 'mercado';
  repairEst: number;
  repairSource: 'historial' | 'mercado' | 'none';
  profit: number;
  marginPct: number; // beneficio / (compra + reparación)
  level: 'good' | 'ok' | 'bad'; // good = chollo claro, ok = justo, bad = no merece
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/**
 * Estima el beneficio de comprar una oferta y revenderla:
 *   beneficio = venta estimada − precio de compra − reparación estimada
 * Venta y reparación salen del historial del usuario para ese modelo; si no hay,
 * de una tabla de mercado aproximada. Devuelve null si no se reconoce el modelo
 * o no hay precio de compra.
 */
export function estimateDealProfit(
  title: string | null | undefined,
  description: string | null | undefined,
  price: number | null | undefined,
  stockItems: StockItem[]
): DealProfit | null {
  const m = detectModel(title);
  if (!m) return null;
  const buyPrice = Number(price) || 0;
  if (buyPrice <= 0) return null;

  const broken = looksBroken(`${title ?? ''} ${description ?? ''}`);

  // Ventas previas del usuario de ese modelo
  const soldOfModel = stockItems.filter(
    (h) => h.estado === 'Vendido' && Number(h.precio_venta_real) > 0 && detectModel(h.name)?.key === m.key
  );

  // Precio de venta estimado
  let saleEst: number;
  let saleSource: DealProfit['saleSource'];
  if (soldOfModel.length >= 1) {
    saleEst = avg(soldOfModel.map((h) => Number(h.precio_venta_real)));
    saleSource = 'historial';
  } else {
    const ref = refSalePrice(m.key);
    if (ref == null) return null; // sin referencia de venta → no estimamos
    saleEst = ref;
    saleSource = 'mercado';
  }

  // Coste de reparación estimado (solo si parece roto)
  let repairEst = 0;
  let repairSource: DealProfit['repairSource'] = 'none';
  if (broken) {
    const repaired = soldOfModel.filter((h) => Number(h.coste_reparacion) > 0);
    if (repaired.length >= 1) {
      repairEst = avg(repaired.map((h) => Number(h.coste_reparacion)));
      repairSource = 'historial';
    } else {
      repairEst = refRepairCost(m.key) ?? 0;
      repairSource = repairEst > 0 ? 'mercado' : 'none';
    }
  }

  const profit = saleEst - buyPrice - repairEst;
  const base = buyPrice + repairEst;
  const marginPct = base > 0 ? (profit / base) * 100 : 0;

  // Nivel: chollo claro (verde) / justo (ámbar) / no merece (gris)
  const level: DealProfit['level'] =
    profit >= 40 && marginPct >= 25 ? 'good' : profit >= 15 ? 'ok' : 'bad';

  return {
    model: m.label,
    broken,
    buyPrice,
    saleEst: Math.round(saleEst),
    saleSource,
    repairEst: Math.round(repairEst),
    repairSource,
    profit: Math.round(profit),
    marginPct: Math.round(marginPct),
    level,
  };
}
