-- Add new columns for talla and color
ALTER TABLE public.stock_items ADD COLUMN talla text;
ALTER TABLE public.stock_items ADD COLUMN color text;

-- Remove units_in_stock column (we'll assume 1 unit per product)
ALTER TABLE public.stock_items DROP COLUMN units_in_stock;