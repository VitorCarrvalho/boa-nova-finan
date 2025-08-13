-- Since congregations_public is a view, we need to ensure the view has proper access
-- Let's modify the existing RLS policy for public access to congregations table

-- Update the existing policy to allow anonymous users to view basic congregation info
DROP POLICY IF EXISTS "Public can view basic congregation info for registration" ON public.congregations;

CREATE POLICY "Public can view basic congregation info for registration" 
ON public.congregations 
FOR SELECT 
USING (is_active = true);