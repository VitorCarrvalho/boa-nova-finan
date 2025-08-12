-- Fix the security definer view issue
DROP VIEW IF EXISTS public.congregations_public;

-- Create a simple view without SECURITY DEFINER that only shows safe info
-- This will be used by the client application if needed for registration
CREATE VIEW public.congregations_public AS
SELECT 
  id,
  name,
  city,
  state,
  is_active
FROM public.congregations
WHERE is_active = true;

-- Create an RLS policy specifically for the view if registration needs it
-- But first check if any registration flow actually needs congregation data
-- For now, keeping it secure and requiring authentication