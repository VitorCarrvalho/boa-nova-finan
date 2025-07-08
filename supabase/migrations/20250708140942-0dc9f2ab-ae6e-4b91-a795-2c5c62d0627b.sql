
-- Drop all tables related to the Access Management module
DROP TABLE IF EXISTS public.permission_audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_profile_assignments CASCADE;
DROP TABLE IF EXISTS public.profile_permissions CASCADE;
DROP TABLE IF EXISTS public.access_profiles CASCADE;

-- Drop the permission action enum
DROP TYPE IF EXISTS public.permission_action CASCADE;

-- Remove the functions related to access management
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, TEXT, TEXT, TEXT, permission_action);
