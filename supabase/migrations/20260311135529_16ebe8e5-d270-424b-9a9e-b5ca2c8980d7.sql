ALTER TABLE public.repuestos_inventario
  ADD COLUMN marca text NOT NULL DEFAULT 'Apple',
  ADD COLUMN dispositivo text,
  ADD COLUMN modelo text;