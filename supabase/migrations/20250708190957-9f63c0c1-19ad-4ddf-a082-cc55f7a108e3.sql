-- Atualizar função get_current_user_role para usar profile_id
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.name IS NOT NULL THEN ap.name
      WHEN p.approval_status = 'ativo' AND p.role IS NOT NULL THEN p.role::text
      ELSE 'Membro'
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Criar ou atualizar função para obter permissões do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.permissions IS NOT NULL THEN ap.permissions
      ELSE '{}'::jsonb
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Criar ou atualizar função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(
  _module text,
  _action text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.permissions IS NOT NULL THEN 
        COALESCE((ap.permissions -> _module ->> _action)::boolean, false)
      ELSE false
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Atualizar função handle_new_user para usar profile padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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

  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status, profile_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'em_analise',
    _default_profile_id
  );
  RETURN NEW;
END;
$$;