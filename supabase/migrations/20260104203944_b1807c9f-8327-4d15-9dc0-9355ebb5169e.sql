-- Create personal finance movements table
CREATE TABLE public.personal_finance_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  concept TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personal_finance_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can view personal_finance_movements"
ON public.personal_finance_movements
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert personal_finance_movements"
ON public.personal_finance_movements
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update personal_finance_movements"
ON public.personal_finance_movements
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete personal_finance_movements"
ON public.personal_finance_movements
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_finance_movements_updated_at
BEFORE UPDATE ON public.personal_finance_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();