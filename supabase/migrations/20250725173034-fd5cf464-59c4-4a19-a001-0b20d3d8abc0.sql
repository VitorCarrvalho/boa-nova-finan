-- Corrigir a função get_current_user_permissions para lidar com auth.uid() null
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  _user_id uuid;
  _permissions jsonb;
BEGIN
  -- Obter ID do usuário atual
  _user_id := auth.uid();
  
  -- Log para debugging
  RAISE LOG 'get_current_user_permissions: user_id = %', _user_id;
  
  -- Se não há usuário autenticado, retornar objeto vazio
  IF _user_id IS NULL THEN
    RAISE LOG 'get_current_user_permissions: No authenticated user found';
    RETURN '{}'::jsonb;
  END IF;
  
  -- Buscar permissões do perfil ativo do usuário
  SELECT 
    COALESCE(ap.permissions, '{}'::jsonb)
  INTO _permissions
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id AND ap.is_active = true
  WHERE p.id = _user_id 
    AND p.approval_status = 'ativo';
  
  -- Log para debugging
  RAISE LOG 'get_current_user_permissions: permissions = %', _permissions;
  
  -- Se não encontrou permissões, retornar objeto vazio
  IF _permissions IS NULL THEN
    RAISE LOG 'get_current_user_permissions: No permissions found for user';
    RETURN '{}'::jsonb;
  END IF;
  
  RETURN _permissions;
END;
$function$;