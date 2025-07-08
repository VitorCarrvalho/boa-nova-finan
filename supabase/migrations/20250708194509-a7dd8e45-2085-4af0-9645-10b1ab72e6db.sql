-- Atualizar função approve_user para enviar email de aprovação (versão corrigida)
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
  _mapped_role user_role;
  _user_email TEXT;
  _user_name TEXT;
  _congregation_name TEXT;
  _email_payload jsonb;
  _email_response jsonb;
BEGIN
  -- Get current status and profile_id
  SELECT approval_status, profile_id, email, name INTO _previous_status, _previous_profile_id, _user_email, _user_name
  FROM public.profiles WHERE id = _user_id;
  
  -- Get profile name for audit log
  SELECT name INTO _profile_name FROM public.access_profiles WHERE id = _profile_id;
  
  -- Get congregation name if provided
  IF _congregation_id IS NOT NULL THEN
    SELECT name INTO _congregation_name FROM public.congregations WHERE id = _congregation_id;
  END IF;
  
  -- Map profile name to user_role enum (same logic as get_current_user_role)
  _mapped_role := CASE _profile_name
    WHEN 'Admin' THEN 'admin'::user_role
    WHEN 'Pastor' THEN 'pastor'::user_role
    WHEN 'Gerente Financeiro' THEN 'finance'::user_role
    ELSE 'worker'::user_role
  END;
  
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
  
  -- Log the approval using the correctly mapped role
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, congregation_id, ministries
  ) VALUES (
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'ativo',
    NULL, _mapped_role, _congregation_id, _ministries
  );
  
  -- Send approval email
  IF _user_email IS NOT NULL THEN
    BEGIN
      -- Prepare email payload
      _email_payload := jsonb_build_object(
        'userEmail', _user_email,
        'userName', _user_name,
        'profileName', _profile_name,
        'congregationName', _congregation_name,
        'loginUrl', 'https://jryifbcsifodvocshnvuo.supabase.co/'
      );
      
      -- Call edge function to send email using the supabase client approach
      PERFORM net.http_post(
        url := 'https://jryifbcsifodvocshnvuo.supabase.co/functions/v1/send-approval-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeWlmYmNzaWZvZHZvY3NobnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzAwOTYsImV4cCI6MjA2NTc0NjA5Nn0.19evtStOEzVAbXX-Z27xi35JnTC7vd046EDRFrb9ETE'
        ),
        body := _email_payload
      );
      
      -- Log email sending attempt (optional)
      RAISE NOTICE 'Approval email queued for %', _user_email;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the approval process
      RAISE NOTICE 'Failed to send approval email to %: %', _user_email, SQLERRM;
    END;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Criar extensão pg_net se não existir (necessária para chamar URLs externas)
CREATE EXTENSION IF NOT EXISTS pg_net;