
-- Fix: Remove tenant_id IS NULL so org users only see their own tenant profiles
DROP POLICY "Tenant users can view their tenant access profiles" ON access_profiles;
CREATE POLICY "Tenant users can view their tenant access profiles"
  ON access_profiles FOR SELECT TO public
  USING (
    is_super_admin() 
    OR (is_active = true AND tenant_id = get_user_tenant_id(auth.uid()))
  );

-- Replace the old self-view policy with a cleaner one
DROP POLICY IF EXISTS "Users can view their own active access profile" ON access_profiles;
CREATE POLICY "Users can view own active profile"
  ON access_profiles FOR SELECT TO public
  USING (id = get_current_user_profile_id() AND is_active = true);
