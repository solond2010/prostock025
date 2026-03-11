CREATE TABLE public.repuestos_inventario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.repuestos_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view repuestos"
  ON public.repuestos_inventario FOR SELECT
  TO public
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert repuestos"
  ON public.repuestos_inventario FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update repuestos"
  ON public.repuestos_inventario FOR UPDATE
  TO public
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete repuestos"
  ON public.repuestos_inventario FOR DELETE
  TO public
  USING (auth.role() = 'authenticated');