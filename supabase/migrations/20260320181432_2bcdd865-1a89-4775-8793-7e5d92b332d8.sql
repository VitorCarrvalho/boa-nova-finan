-- 1. Create SECURITY DEFINER function to get current user's profile_id (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT profile_id FROM public.profiles
  WHERE id = auth.uid()
    AND approval_status = 'ativo'
    AND profile_id IS NOT NULL
  LIMIT 1;
$$;

-- 2. Replace the problematic access_profiles policy that caused recursion
DROP POLICY IF EXISTS "Users can view their own active access profile" ON public.access_profiles;

CREATE POLICY "Users can view their own active access profile"
ON public.access_profiles
FOR SELECT
TO public
USING (
  (id = get_current_user_profile_id()) AND (is_active = true)
);