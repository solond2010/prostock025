export interface StockItem {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  units_in_stock: number;
  purchase_price_per_unit: number;
  sale_price_per_unit: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockItemFormData {
  name: string;
  category: string;
  purchase_date: string;
  units_in_stock: number;
  purchase_price_per_unit: number;
  sale_price_per_unit: number;
  notes: string;
}

export interface StockItemWithCalculations extends StockItem {
  invested: number;
  expected_revenue: number;
  expected_profit: number;
}

export interface StockSummary {
  totalInvested: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  profitMargin: number;
}
