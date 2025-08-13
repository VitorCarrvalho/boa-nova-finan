-- Create RLS policy for public access to congregations_public view
DROP POLICY IF EXISTS "Allow public access to congregations_public" ON public.congregations_public;

CREATE POLICY "Allow public access to congregations_public" 
ON public.congregations_public 
FOR SELECT 
USING (true);