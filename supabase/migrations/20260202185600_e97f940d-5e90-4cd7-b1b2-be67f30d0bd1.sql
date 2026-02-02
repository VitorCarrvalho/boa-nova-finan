-- Fix infinite recursion in RLS policies for public.tenant_admins
-- Root cause: policies on tenant_admins referenced tenant_admins directly (self-referential subqueries)
-- which triggers Postgres error 42P17 (infinite recursion) and breaks tenant resolution.

BEGIN;

-- 1) Create helper function to check tenant ownership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_tenant_owner(_user_id uuid DEFAULT auth.uid(), _tenant_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_admins ta
    WHERE ta.user_id = _user_id
      AND (_tenant_id IS NULL OR ta.tenant_id = _tenant_id)
      AND ta.role = 'owner'::public.tenant_admin_role
  );
$$;

-- 2) Replace problematic policies
DROP POLICY IF EXISTS "Super admins can manage all tenant admins" ON public.tenant_admins;
DROP POLICY IF EXISTS "Super admins can manage tenant admins" ON public.tenant_admins;
DROP POLICY IF EXISTS "Tenant admins can view their admins" ON public.tenant_admins;
DROP POLICY IF EXISTS "Tenant owners can manage their admins" ON public.tenant_admins;
DROP POLICY IF EXISTS "Users can view their tenant admin status" ON public.tenant_admins;

-- Super admins: full access
CREATE POLICY "Super admins can manage tenant admins"
ON public.tenant_admins
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Users can always read their own tenant_admin row (useful to know their status)
CREATE POLICY "Users can view own tenant admin row"
ON public.tenant_admins
FOR SELECT
USING (user_id = auth.uid());

-- Tenant admins (owner/admin) can list tenant admins for their tenant (SELECT only)
CREATE POLICY "Tenant admins can view tenant admins"
ON public.tenant_admins
FOR SELECT
USING (public.is_tenant_admin(auth.uid(), tenant_id));

-- Tenant owners can manage tenant admins for their tenant (ALL)
CREATE POLICY "Tenant owners can manage tenant admins"
ON public.tenant_admins
FOR ALL
USING (public.is_tenant_owner(auth.uid(), tenant_id))
WITH CHECK (public.is_tenant_owner(auth.uid(), tenant_id));

COMMIT;