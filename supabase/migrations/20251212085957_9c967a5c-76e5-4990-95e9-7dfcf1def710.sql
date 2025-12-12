-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Allow all operations" ON public.stock_items;

-- Create policies for authenticated users only
CREATE POLICY "Authenticated users can view stock items"
ON public.stock_items
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert stock items"
ON public.stock_items
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update stock items"
ON public.stock_items
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete stock items"
ON public.stock_items
FOR DELETE
USING (auth.role() = 'authenticated');