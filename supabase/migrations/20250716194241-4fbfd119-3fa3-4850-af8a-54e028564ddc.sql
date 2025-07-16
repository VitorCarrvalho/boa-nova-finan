-- Atualizar função reject_user para permitir recadastro
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id uuid, 
  _rejection_reason text DEFAULT NULL::text, 
  _rejected_by uuid DEFAULT NULL::uuid,
  _allow_reapply boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _previous_status TEXT;
  _previous_role user_role;
BEGIN
  -- Get current status and role
  SELECT approval_status, role INTO _previous_status, _previous_role
  FROM public.profiles WHERE id = _user_id;
  
  -- Log the rejection BEFORE potential deletion
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, rejection_reason
  ) VALUES (
    _user_id, COALESCE(_rejected_by, auth.uid()), _previous_status, 'rejeitado',
    _previous_role, _previous_role, _rejection_reason
  );
  
  IF _allow_reapply THEN
    -- Delete user from auth.users (cascades to profiles)
    -- This allows them to re-register with the same email
    DELETE FROM auth.users WHERE id = _user_id;
  ELSE
    -- Keep current behavior: just mark as rejected
    UPDATE public.profiles 
    SET 
      approval_status = 'rejeitado',
      rejection_reason = _rejection_reason,
      approved_by = COALESCE(_rejected_by, auth.uid()),
      approved_at = now()
    WHERE id = _user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;