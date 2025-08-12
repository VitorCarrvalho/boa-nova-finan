-- Fix security vulnerability: Remove public access to sensitive congregation data
-- and create a limited view for registration purposes if needed

-- First, drop the dangerous public SELECT policy
DROP POLICY IF EXISTS "Unauthenticated users can view active congregations for registr" ON public.congregations;

-- Create a limited public view that only exposes non-sensitive information for registration
CREATE OR REPLACE VIEW public.congregations_public AS
SELECT 
  id,
  name,
  city,
  state,
  is_active
FROM public.congregations
WHERE is_active = true;

-- Enable RLS on the view (though views inherit from base table)
-- This view only shows basic info needed for user registration

-- Create a policy for the public view (if needed for registration)
-- Users can only see basic congregation info for registration purposes
CREATE POLICY "Public can view basic congregation info for registration"
ON public.congregations
FOR SELECT
TO anon
USING (false); -- Completely block anonymous access to main table

-- Ensure authenticated users still have proper access through existing policies
-- (The existing permission-based policies remain intact)