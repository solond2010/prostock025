-- Create gastos_material table (completely independent from stock_items)
CREATE TABLE public.gastos_material (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  coste NUMERIC NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gastos_material ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view gastos_material"
ON public.gastos_material
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert gastos_material"
ON public.gastos_material
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update gastos_material"
ON public.gastos_material
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete gastos_material"
ON public.gastos_material
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gastos_material_updated_at
BEFORE UPDATE ON public.gastos_material
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();