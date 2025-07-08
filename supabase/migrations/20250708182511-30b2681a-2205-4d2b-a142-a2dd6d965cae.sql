-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Recreate function with correct return type
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.name IS NOT NULL THEN ap.name
      ELSE 'membro'
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;