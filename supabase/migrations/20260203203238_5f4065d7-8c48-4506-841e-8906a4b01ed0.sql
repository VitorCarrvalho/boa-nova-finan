-- Recriar função get_user_tenant_id que foi removida
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;