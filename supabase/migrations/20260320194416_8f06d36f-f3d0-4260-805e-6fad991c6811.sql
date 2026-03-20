
CREATE OR REPLACE FUNCTION public.get_tenant_profiles(
  _status text DEFAULT 'ativo'
)
RETURNS TABLE(
  id uuid, name text, email text, role user_role,
  profile_id uuid, congregation_id uuid, 
  approval_status text, created_at timestamptz,
  photo_url text, ministries text[],
  rejection_reason text, tenant_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.name, p.email, p.role,
         p.profile_id, p.congregation_id,
         p.approval_status, p.created_at,
         p.photo_url, p.ministries,
         p.rejection_reason, p.tenant_id
  FROM public.profiles p
  WHERE p.tenant_id = get_user_tenant_id(auth.uid())
    AND p.approval_status = _status
  ORDER BY p.name;
$$;
