-- Corrigir função handle_new_user para definir role como 'worker' por padrão (que representa membro)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _default_profile_id UUID;
BEGIN
  -- Get default profile ID (Membro)
  SELECT id INTO _default_profile_id 
  FROM public.access_profiles 
  WHERE name = 'Membro' AND is_active = true
  LIMIT 1;

  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status, profile_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'em_analise',
    _default_profile_id,
    'worker'::user_role  -- Usar 'worker' que representa 'membro' no enum
  );
  RETURN NEW;
END;
$$;