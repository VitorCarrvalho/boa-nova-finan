-- Dropar a função antiga
DROP FUNCTION IF EXISTS public.approve_user(uuid, user_role, uuid, text[], uuid);

-- Criar a nova função com profile_id
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id uuid, 
  _profile_id uuid,
  _congregation_id uuid DEFAULT NULL::uuid, 
  _ministries text[] DEFAULT NULL::text[], 
  _approved_by uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _previous_status TEXT;
  _previous_profile_id UUID;
  _profile_name TEXT;
BEGIN
  -- Get current status and profile_id
  SELECT approval_status, profile_id INTO _previous_status, _previous_profile_id
  FROM public.profiles WHERE id = _user_id;
  
  -- Get profile name for audit log
  SELECT name INTO _profile_name FROM public.access_profiles WHERE id = _profile_id;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    approval_status = 'ativo',
    profile_id = _profile_id,
    congregation_id = _congregation_id,
    ministries = _ministries,
    approved_by = COALESCE(_approved_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  -- Log the approval (using profile name instead of role)
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, congregation_id, ministries
  ) VALUES (
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'ativo',
    NULL, _profile_name::user_role, _congregation_id, _ministries
  );
  
  RETURN TRUE;
END;
$$;