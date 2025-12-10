-- Add phone-specific columns to stock_items
ALTER TABLE public.stock_items 
ADD COLUMN almacenamiento text,
ADD COLUMN bateria_porcentaje integer,
ADD COLUMN reparaciones text[];