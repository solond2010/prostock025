-- Método de cobro al vender un producto: efectivo / banco / otro, + nota libre.
alter table public.stock_items add column if not exists metodo_cobro text;     -- 'efectivo' | 'banco' | 'otro'
alter table public.stock_items add column if not exists cobro_nota  text;      -- detalle libre (ej. "mitad efectivo, mitad banco")
notify pgrst, 'reload schema';
