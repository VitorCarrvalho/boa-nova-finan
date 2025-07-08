-- Add approval status and congregation to profiles
ALTER TABLE public.profiles 
ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN congregation_id UUID REFERENCES public.congregations(id),
ADD COLUMN ministries TEXT[],
ADD COLUMN approved_by UUID REFERENCES auth.users,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejection_reason TEXT;

-- Add comment for approval status values
COMMENT ON COLUMN public.profiles.approval_status IS 'Values: pending, approved, rejected';

-- Create approval audit logs table
CREATE TABLE public.approval_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  changed_by UUID REFERENCES auth.users NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  previous_role user_role,
  new_role user_role,
  congregation_id UUID REFERENCES public.congregations(id),
  ministries TEXT[],
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on approval_audit_logs
ALTER TABLE public.approval_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for approval audit logs
CREATE POLICY "Admins can view approval audit logs" 
ON public.approval_audit_logs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Update profiles RLS policies to handle pending users
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- New policies for profiles
CREATE POLICY "Approved users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id AND approval_status = 'approved') OR 
  get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role])
);

CREATE POLICY "Approved users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = id AND approval_status = 'approved') OR 
  get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role])
);

-- Admins can update any profile (for approval workflow)
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Function to handle user approval
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id UUID,
  _role user_role,
  _congregation_id UUID DEFAULT NULL,
  _ministries TEXT[] DEFAULT NULL,
  _approved_by UUID DEFAULT NULL
)
RETURNS BOOLEAN
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
    approval_status = 'approved',
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
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'approved',
    _previous_role, _role, _congregation_id, _ministries
  );
  
  RETURN TRUE;
END;
$$;

-- Function to handle user rejection
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id UUID,
  _rejection_reason TEXT DEFAULT NULL,
  _rejected_by UUID DEFAULT NULL
)
RETURNS BOOLEAN
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
    approval_status = 'rejected',
    rejection_reason = _rejection_reason,
    approved_by = COALESCE(_rejected_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  -- Log the rejection
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, rejection_reason
  ) VALUES (
    _user_id, COALESCE(_rejected_by, auth.uid()), _previous_status, 'rejected',
    _previous_role, _previous_role, _rejection_reason
  );
  
  RETURN TRUE;
END;
$$;

-- Function to get user permissions based on profile assignments
CREATE OR REPLACE FUNCTION public.get_user_module_permissions(
  _user_id UUID,
  _module TEXT,
  _submodule TEXT DEFAULT NULL
)
RETURNS TABLE (
  can_view BOOLEAN,
  can_insert BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(bool_or(pp.action = 'view'), false) as can_view,
    COALESCE(bool_or(pp.action = 'insert'), false) as can_insert,
    COALESCE(bool_or(pp.action = 'edit'), false) as can_edit,
    COALESCE(bool_or(pp.action = 'inactivate'), false) as can_delete
  FROM public.user_profile_assignments upa
  JOIN public.access_profiles ap ON upa.profile_id = ap.id
  JOIN public.profile_permissions pp ON ap.id = pp.profile_id
  WHERE upa.user_id = _user_id
    AND pp.module = _module
    AND (pp.submodule = _submodule OR (_submodule IS NULL AND pp.submodule IS NULL));
$$;

-- Update get_current_user_role to check approval status
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN approval_status = 'approved' THEN role
      ELSE 'worker'::user_role
    END
  FROM public.profiles 
  WHERE id = auth.uid();
$$;