CREATE OR REPLACE FUNCTION public.count_profiles_by_tenant(_tenant_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) FROM public.profiles WHERE tenant_id = _tenant_id;
$$;