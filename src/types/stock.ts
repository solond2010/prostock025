export interface StockItem {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  units_in_stock: number;
  purchase_price_per_unit: number;
  sale_price_per_unit: number;
  notes: string | null;
  estado: 'En stock' | 'Vendido';
  precio_envio: number;
  coste_reparacion: number;
  fecha_venta: string | null;
  precio_venta_real: number;
  created_at: string;
  updated_at: string;
  // Campos específicos de telefonía
  almacenamiento: string | null;
  bateria_porcentaje: number | null;
  reparaciones: string[] | null;
}

export interface StockItemFormData {
  name: string;
  category: string;
  purchase_date: string;
  units_in_stock: number;
  purchase_price_per_unit: number;
  sale_price_per_unit: number;
  notes: string;
  estado: 'En stock' | 'Vendido';
  precio_envio: number;
  coste_reparacion: number;
  fecha_venta: string;
  precio_venta_real: number;
  // Campos específicos de telefonía
  almacenamiento: string;
  bateria_porcentaje: number | null;
  reparaciones: string[];
}

export interface StockItemWithCalculations extends StockItem {
  coste_total: number;
  beneficio_esperado: number;
  beneficio_real: number | null;
}

export interface StockSummary {
  totalInvested: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  totalRealProfit: number;
  profitMargin: number;
}
