-- Criar política RLS para permitir que usuários vejam seu próprio perfil ativo
CREATE POLICY "Users can view their own active access profile" 
ON public.access_profiles 
FOR SELECT 
USING (
  id IN (
    SELECT p.profile_id 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.approval_status = 'ativo'
    AND p.profile_id IS NOT NULL
  )
  AND is_active = true
);

-- Criar função para retornar permissões do usuário autenticado (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_authenticated_user_permissions()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _profile_name text;
  _permissions jsonb;
BEGIN
  -- Obter ID do usuário atual
  _user_id := auth.uid();
  
  -- Log para debugging
  RAISE LOG 'get_authenticated_user_permissions: user_id = %', _user_id;
  
  -- Se não há usuário autenticado, retornar objeto vazio
  IF _user_id IS NULL THEN
    RAISE LOG 'get_authenticated_user_permissions: No authenticated user found';
    RETURN '{"profile_name": null, "permissions": {}}'::jsonb;
  END IF;
  
  -- Buscar perfil e permissões do usuário ativo
  SELECT 
    ap.name,
    COALESCE(ap.permissions, '{}'::jsonb)
  INTO _profile_name, _permissions
  FROM public.profiles p
  INNER JOIN public.access_profiles ap ON p.profile_id = ap.id 
  WHERE p.id = _user_id 
    AND p.approval_status = 'ativo'
    AND ap.is_active = true
  LIMIT 1;
  
  -- Log para debugging
  RAISE LOG 'get_authenticated_user_permissions: profile_name = %, permissions = %', _profile_name, _permissions;
  
  -- Se não encontrou, retornar objeto vazio
  IF _profile_name IS NULL THEN
    RAISE LOG 'get_authenticated_user_permissions: No active profile found for user';
    RETURN '{"profile_name": null, "permissions": {}}'::jsonb;
  END IF;
  
  -- Retornar resultado estruturado
  RETURN jsonb_build_object(
    'profile_name', _profile_name,
    'permissions', _permissions
  );
END;
$$;