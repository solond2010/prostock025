import { differenceInDays } from 'date-fns';
import { detectModel } from './iphoneModels';
import { StockItem } from '@/types/stock';

export interface PriceInsight {
  model: string;
  avgSale: number;
  count: number;
  avgDays: number | null;
  asking: number;
  deltaPct: number;
  level: 'low' | 'fair' | 'high';
  message: string;
}

/**
 * Inteligencia de precio para un producto EN STOCK: compara su precio pedido
 * con tu media histórica de venta real de ese mismo modelo de iPhone.
 * Devuelve null si no se reconoce el modelo o no hay suficientes ventas previas.
 */
export function getPriceInsight(item: StockItem, allItems: StockItem[]): PriceInsight | null {
  if (item.estado !== 'En stock') return null;
  const m = detectModel(item.name);
  if (!m) return null;

  const asking = Number(item.sale_price_per_unit) || 0;
  if (asking <= 0) return null;

  const sold = allItems.filter(
    (h) =>
      h.estado === 'Vendido' &&
      Number(h.precio_venta_real) > 0 &&
      h.id !== item.id &&
      detectModel(h.name)?.key === m.key
  );
  if (sold.length < 2) return null; // pocas referencias para fiarse

  const avgSale = sold.reduce((s, h) => s + Number(h.precio_venta_real), 0) / sold.length;
  const withDays = sold.filter((h) => h.fecha_venta && h.purchase_date);
  const avgDays = withDays.length
    ? withDays.reduce(
        (s, h) => s + Math.max(0, differenceInDays(new Date(h.fecha_venta!), new Date(h.purchase_date))),
        0
      ) / withDays.length
    : null;

  const deltaPct = ((asking - avgSale) / avgSale) * 100;

  let level: PriceInsight['level'];
  let message: string;
  if (deltaPct > 12) {
    level = 'high';
    message = `Pides un ${Math.round(deltaPct)}% por encima de tu media (${Math.round(avgSale)}€). Puede tardar — baja el precio para venderlo antes.`;
  } else if (deltaPct < -12) {
    level = 'low';
    message = `Por debajo de tu media (${Math.round(avgSale)}€). Se venderá rápido… o podrías pedir algo más.`;
  } else {
    level = 'fair';
    message = `En tu precio de mercado (~${Math.round(avgSale)}€).`;
  }

  return { model: m.label, avgSale, count: sold.length, avgDays, asking, deltaPct, level, message };
}
