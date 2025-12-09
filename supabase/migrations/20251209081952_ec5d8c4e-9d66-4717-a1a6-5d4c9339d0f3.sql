-- Add new columns to stock_items table
ALTER TABLE public.stock_items 
ADD COLUMN estado text NOT NULL DEFAULT 'En stock',
ADD COLUMN precio_envio numeric NOT NULL DEFAULT 0,
ADD COLUMN coste_reparacion numeric NOT NULL DEFAULT 0,
ADD COLUMN fecha_venta date,
ADD COLUMN precio_venta_real numeric NOT NULL DEFAULT 0;

-- Add check constraint for estado values
ALTER TABLE public.stock_items 
ADD CONSTRAINT check_estado CHECK (estado IN ('En stock', 'Vendido'));