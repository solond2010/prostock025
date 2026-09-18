ALTER TABLE public.stock_items
  ADD COLUMN IF NOT EXISTS metodo_cobro text,
  ADD COLUMN IF NOT EXISTS cobro_nota text;