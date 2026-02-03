-- ============================================
-- Fix multi-tenant isolation: remove permissive policies
-- and tighten SELECT policies that leaked cross-tenant rows.
-- ============================================

-- ----------------------
-- MEMBERS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver membros" ON public.members;
DROP POLICY IF EXISTS "Usuários com permissão podem criar membros" ON public.members;
DROP POLICY IF EXISTS "Usuários com permissão podem editar membros" ON public.members;
DROP POLICY IF EXISTS "Users can view members for dropdowns" ON public.members;

-- ----------------------
-- ACCOUNTS_PAYABLE
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver contas a pagar" ON public.accounts_payable;
DROP POLICY IF EXISTS "Usuários com permissão podem criar contas a pagar" ON public.accounts_payable;
DROP POLICY IF EXISTS "Usuários com permissão podem editar contas a pagar" ON public.accounts_payable;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar contas a pagar" ON public.accounts_payable;

-- ----------------------
-- CHURCH_EVENTS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver eventos" ON public.church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem criar eventos" ON public.church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem atualizar eventos" ON public.church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar eventos" ON public.church_events;

-- Fix leaking SELECT policy (had OR is_active=true)
DROP POLICY IF EXISTS "Tenant users can view their tenant events" ON public.church_events;
CREATE POLICY "Tenant users can view their tenant events"
ON public.church_events
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR (
    tenant_id = get_user_tenant_id(auth.uid())
    OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL)
  )
);

-- Keep public events readable only for anon (prevents authenticated cross-tenant reads)
DROP POLICY IF EXISTS "Public can view active events" ON public.church_events;
CREATE POLICY "Public can view active events"
ON public.church_events
FOR SELECT
TO anon
USING (is_active = true);

-- ----------------------
-- CONGREGATIONS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver congregações" ON public.congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem criar congregações" ON public.congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem editar congregações" ON public.congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar congregações" ON public.congregations;

-- Remove public access on the full congregations table (use congregations_public instead)
DROP POLICY IF EXISTS "Public can view basic congregation info for registration" ON public.congregations;

-- Fix leaking SELECT policy (had OR is_active=true)
DROP POLICY IF EXISTS "Tenant users can view their tenant congregations" ON public.congregations;
CREATE POLICY "Tenant users can view their tenant congregations"
ON public.congregations
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR (
    tenant_id = get_user_tenant_id(auth.uid())
    OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL)
  )
);

-- ----------------------
-- MINISTRIES
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver ministérios" ON public.ministries;
DROP POLICY IF EXISTS "Usuários com permissão podem criar ministérios" ON public.ministries;
DROP POLICY IF EXISTS "Usuários com permissão podem editar ministérios" ON public.ministries;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar ministérios" ON public.ministries;
DROP POLICY IF EXISTS "Users can view ministries for dropdowns" ON public.ministries;

-- ----------------------
-- DEPARTMENTS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver departamentos" ON public.departments;
DROP POLICY IF EXISTS "Usuários com permissão podem criar departamentos" ON public.departments;
DROP POLICY IF EXISTS "Usuários com permissão podem editar departamentos" ON public.departments;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar departamentos" ON public.departments;

-- ----------------------
-- FINANCIAL_RECORDS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem ver registros financeiros" ON public.financial_records;
DROP POLICY IF EXISTS "Usuários com permissão podem criar registros financeiros" ON public.financial_records;
DROP POLICY IF EXISTS "Usuários com permissão podem editar registros financeiros" ON public.financial_records;

-- ----------------------
-- RECONCILIATIONS
-- ----------------------
DROP POLICY IF EXISTS "Usuários com permissão podem criar conciliações" ON public.reconciliations;
DROP POLICY IF EXISTS "Usuários com permissão podem aprovar/rejeitar conciliações" ON public.reconciliations;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar conciliações" ON public.reconciliations;
DROP POLICY IF EXISTS "Usuários podem editar suas próprias conciliações pendentes" ON public.reconciliations;
DROP POLICY IF EXISTS "Usuários podem ver conciliações baseado em permissões" ON public.reconciliations;

-- ----------------------
-- EXPENSE_CATEGORIES
-- ----------------------
DROP POLICY IF EXISTS "Todos podem ver categorias ativas" ON public.expense_categories;

-- Fix leaking SELECT policy (had OR is_active=true across tenants)
DROP POLICY IF EXISTS "Tenant users can view their tenant expense categories" ON public.expense_categories;
CREATE POLICY "Tenant users can view their tenant expense categories"
ON public.expense_categories
FOR SELECT
TO authenticated
USING (
  is_super_admin()
  OR (
    is_active = true
    AND (
      tenant_id = get_user_tenant_id(auth.uid())
      OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL)
    )
  )
);

-- ----------------------
-- ACCESS_PROFILES
-- ----------------------
DROP POLICY IF EXISTS "Admins can manage access profiles" ON public.access_profiles;

CREATE POLICY "Superadmins can manage access profiles"
ON public.access_profiles
FOR ALL
TO authenticated
USING (get_current_user_role() = 'superadmin'::public.user_role)
WITH CHECK (get_current_user_role() = 'superadmin'::public.user_role);

CREATE POLICY "Tenant admins can manage their access profiles"
ON public.access_profiles
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'admin'::public.user_role
  AND tenant_id = get_user_tenant_id(auth.uid())
)
WITH CHECK (
  get_current_user_role() = 'admin'::public.user_role
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Undo accidental tenant_id assignment on global profiles (keep templates global)
UPDATE public.access_profiles
SET tenant_id = NULL
WHERE tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939'::uuid;