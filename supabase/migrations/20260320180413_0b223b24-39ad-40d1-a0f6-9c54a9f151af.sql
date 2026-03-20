
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(_user_ids uuid[])
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.name, p.email
  FROM public.profiles p
  WHERE p.id = ANY(_user_ids);
$$;
