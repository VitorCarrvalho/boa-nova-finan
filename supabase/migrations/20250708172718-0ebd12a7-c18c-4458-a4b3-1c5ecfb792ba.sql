-- Drop existing policies that depend on approval_status column
DROP POLICY IF EXISTS "Approved users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Approved users can update their own profile" ON public.profiles;

-- Update existing status values to new format
UPDATE public.profiles 
SET approval_status = CASE 
  WHEN approval_status = 'pending' THEN 'em_analise'
  WHEN approval_status = 'approved' THEN 'ativo'
  WHEN approval_status = 'rejected' THEN 'rejeitado'
  ELSE 'em_analise'
END;

-- Set default status for new users
ALTER TABLE public.profiles 
ALTER COLUMN approval_status SET DEFAULT 'em_analise';

-- Update the get_current_user_role function to use new status values
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN approval_status = 'ativo' THEN role
      ELSE 'worker'::user_role
    END
  FROM public.profiles 
  WHERE id = auth.uid();
$$;

-- Update the handle_new_user function to use new status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'em_analise'
  );
  RETURN NEW;
END;
$$;

-- Update approve_user function to use new status values
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id uuid, 
  _role user_role, 
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
  _previous_role user_role;
BEGIN
  -- Get current status and role
  SELECT approval_status, role INTO _previous_status, _previous_role
  FROM public.profiles WHERE id = _user_id;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    approval_status = 'ativo',
    role = _role,
    congregation_id = _congregation_id,
    ministries = _ministries,
    approved_by = COALESCE(_approved_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  -- Log the approval
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, congregation_id, ministries
  ) VALUES (
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'ativo',
    _previous_role, _role, _congregation_id, _ministries
  );
  
  RETURN TRUE;
END;
$$;

-- Update reject_user function to use new status values
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id uuid, 
  _rejection_reason text DEFAULT NULL::text, 
  _rejected_by uuid DEFAULT NULL::uuid
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
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    approval_status = 'rejeitado',
    rejection_reason = _rejection_reason,
    approved_by = COALESCE(_rejected_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  -- Log the rejection
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, rejection_reason
  ) VALUES (
    _user_id, COALESCE(_rejected_by, auth.uid()), _previous_status, 'rejeitado',
    _previous_role, _previous_role, _rejection_reason
  );
  
  RETURN TRUE;
END;
$$;

-- Recreate policies with new status values
CREATE POLICY "Approved users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (((auth.uid() = id) AND (approval_status = 'ativo')) OR (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role])));

CREATE POLICY "Approved users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (((auth.uid() = id) AND (approval_status = 'ativo')) OR (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role])));