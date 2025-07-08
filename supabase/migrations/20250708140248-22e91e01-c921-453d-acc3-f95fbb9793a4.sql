
-- First, let's ensure we drop any conflicting objects if they exist
DROP TABLE IF EXISTS public.permission_audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_profile_assignments CASCADE;
DROP TABLE IF EXISTS public.profile_permissions CASCADE;
DROP TABLE IF EXISTS public.access_profiles CASCADE;
DROP TYPE IF EXISTS public.permission_action CASCADE;

-- Create enum for permission actions
CREATE TYPE public.permission_action AS ENUM (
  'view',
  'insert', 
  'edit',
  'inactivate',
  'approve',
  'export',
  'send_notification'
);

-- Create access profiles table
CREATE TABLE public.access_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_profile BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profile permissions table
CREATE TABLE public.profile_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.access_profiles(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  submodule TEXT,
  sub_submodule TEXT,
  action permission_action NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, module, submodule, sub_submodule, action)
);

-- Create user profile assignments table
CREATE TABLE public.user_profile_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  profile_id UUID REFERENCES public.access_profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Create permission audit logs table
CREATE TABLE public.permission_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  changed_by UUID REFERENCES auth.users NOT NULL,
  profile_id UUID REFERENCES public.access_profiles(id) NOT NULL,
  module TEXT NOT NULL,
  submodule TEXT,
  sub_submodule TEXT,
  action permission_action NOT NULL,
  operation TEXT NOT NULL, -- 'granted' or 'revoked'
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.access_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for access_profiles
CREATE POLICY "Admins can manage access profiles" 
  ON public.access_profiles 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- RLS policies for profile_permissions
CREATE POLICY "Admins can manage profile permissions" 
  ON public.profile_permissions 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- RLS policies for user_profile_assignments
CREATE POLICY "Admins can manage user profile assignments" 
  ON public.user_profile_assignments 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- RLS policies for permission_audit_logs
CREATE POLICY "Admins can view permission audit logs" 
  ON public.permission_audit_logs 
  FOR SELECT 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Insert default admin profile
INSERT INTO public.access_profiles (name, description, is_system_profile, created_by)
VALUES ('admin', 'Perfil de administrador com acesso total ao sistema', true, '00000000-0000-0000-0000-000000000000');

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE (
  module TEXT,
  submodule TEXT,
  sub_submodule TEXT,
  action permission_action
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT 
    pp.module,
    pp.submodule,
    pp.sub_submodule,
    pp.action
  FROM public.user_profile_assignments upa
  JOIN public.access_profiles ap ON upa.profile_id = ap.id
  JOIN public.profile_permissions pp ON ap.id = pp.profile_id
  WHERE upa.user_id = $1;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
  _user_id UUID,
  _module TEXT,
  _submodule TEXT DEFAULT NULL,
  _sub_submodule TEXT DEFAULT NULL,
  _action permission_action DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.get_user_permissions(_user_id) p
    WHERE p.module = _module
      AND (p.submodule = _submodule OR (_submodule IS NULL AND p.submodule IS NULL))
      AND (p.sub_submodule = _sub_submodule OR (_sub_submodule IS NULL AND p.sub_submodule IS NULL))
      AND p.action = _action
  );
$$;
