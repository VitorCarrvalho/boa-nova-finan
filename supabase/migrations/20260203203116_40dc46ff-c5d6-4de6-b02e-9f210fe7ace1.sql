-- =====================================================
-- MIGRAÇÃO: Isolamento de dados Multi-Tenant (Corrigida)
-- Adiciona tenant_id em todas as tabelas de dados
-- =====================================================

-- 1. Remover função conflitante existente e recriar
DROP FUNCTION IF EXISTS public.get_user_tenant_id();

-- Recriar função sem parâmetro opcional para evitar ambiguidade
-- A função existente tem _user_id uuid DEFAULT auth.uid(), vamos mantê-la
-- e usar diretamente

-- Função para verificar se usuário pertence ao tenant (versão simples)
DROP FUNCTION IF EXISTS public.user_belongs_to_current_tenant(uuid);
CREATE OR REPLACE FUNCTION public.user_belongs_to_current_tenant(target_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (tenant_id = target_tenant_id OR tenant_id IS NULL)
  );
$$;

-- 2. Adicionar coluna tenant_id nas tabelas (nullable inicialmente para não quebrar dados existentes)

-- Members
ALTER TABLE members ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Church Events  
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Congregations
ALTER TABLE congregations ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Ministries
ALTER TABLE ministries ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Financial Records
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Reconciliations
ALTER TABLE reconciliations ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Accounts Payable
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Accounts Payable Approvals
ALTER TABLE accounts_payable_approvals ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Expense Categories
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Access Profiles
ALTER TABLE access_profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Audit Logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_tenant_id ON members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_church_events_tenant_id ON church_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_congregations_tenant_id ON congregations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ministries_tenant_id ON ministries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_tenant_id ON financial_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_tenant_id ON reconciliations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_tenant_id ON accounts_payable(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_tenant_id ON expense_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_access_profiles_tenant_id ON access_profiles(tenant_id);

-- 4. Atualizar RLS policies para filtrar por tenant
-- Usar a função existente get_user_tenant_id(auth.uid())

-- Members: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant members" ON members;
CREATE POLICY "Tenant users can view their tenant members"
  ON members FOR SELECT
  USING (
    is_super_admin()
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant members" ON members;
CREATE POLICY "Tenant users can insert their tenant members"
  ON members FOR INSERT
  WITH CHECK (
    user_has_permission('membros'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant members" ON members;
CREATE POLICY "Tenant users can update their tenant members"
  ON members FOR UPDATE
  USING (
    user_has_permission('membros'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Church Events: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant events" ON church_events;
CREATE POLICY "Tenant users can view their tenant events"
  ON church_events FOR SELECT
  USING (
    is_super_admin()
    OR is_active = true
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant events" ON church_events;
CREATE POLICY "Tenant users can insert their tenant events"
  ON church_events FOR INSERT
  WITH CHECK (
    user_has_permission('eventos'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant events" ON church_events;
CREATE POLICY "Tenant users can update their tenant events"
  ON church_events FOR UPDATE
  USING (
    user_has_permission('eventos'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant events" ON church_events;
CREATE POLICY "Tenant users can delete their tenant events"
  ON church_events FOR DELETE
  USING (
    user_has_permission('eventos'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Congregations: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant congregations" ON congregations;
CREATE POLICY "Tenant users can view their tenant congregations"
  ON congregations FOR SELECT
  USING (
    is_super_admin()
    OR is_active = true
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant congregations" ON congregations;
CREATE POLICY "Tenant users can insert their tenant congregations"
  ON congregations FOR INSERT
  WITH CHECK (
    user_has_permission('congregacoes'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant congregations" ON congregations;
CREATE POLICY "Tenant users can update their tenant congregations"
  ON congregations FOR UPDATE
  USING (
    user_has_permission('congregacoes'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant congregations" ON congregations;
CREATE POLICY "Tenant users can delete their tenant congregations"
  ON congregations FOR DELETE
  USING (
    user_has_permission('congregacoes'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Ministries: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant ministries" ON ministries;
CREATE POLICY "Tenant users can view their tenant ministries"
  ON ministries FOR SELECT
  USING (
    is_super_admin()
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant ministries" ON ministries;
CREATE POLICY "Tenant users can insert their tenant ministries"
  ON ministries FOR INSERT
  WITH CHECK (
    user_has_permission('ministerios'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant ministries" ON ministries;
CREATE POLICY "Tenant users can update their tenant ministries"
  ON ministries FOR UPDATE
  USING (
    user_has_permission('ministerios'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant ministries" ON ministries;
CREATE POLICY "Tenant users can delete their tenant ministries"
  ON ministries FOR DELETE
  USING (
    user_has_permission('ministerios'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Departments: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant departments" ON departments;
CREATE POLICY "Tenant users can view their tenant departments"
  ON departments FOR SELECT
  USING (
    is_super_admin()
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant departments" ON departments;
CREATE POLICY "Tenant users can insert their tenant departments"
  ON departments FOR INSERT
  WITH CHECK (
    user_has_permission('departamentos'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant departments" ON departments;
CREATE POLICY "Tenant users can update their tenant departments"
  ON departments FOR UPDATE
  USING (
    user_has_permission('departamentos'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant departments" ON departments;
CREATE POLICY "Tenant users can delete their tenant departments"
  ON departments FOR DELETE
  USING (
    user_has_permission('departamentos'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Suppliers: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant suppliers" ON suppliers;
CREATE POLICY "Tenant users can view their tenant suppliers"
  ON suppliers FOR SELECT
  USING (
    is_super_admin()
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant suppliers" ON suppliers;
CREATE POLICY "Tenant users can insert their tenant suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (
    user_has_permission('fornecedores'::text, 'insert'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant suppliers" ON suppliers;
CREATE POLICY "Tenant users can update their tenant suppliers"
  ON suppliers FOR UPDATE
  USING (
    user_has_permission('fornecedores'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant suppliers" ON suppliers;
CREATE POLICY "Tenant users can delete their tenant suppliers"
  ON suppliers FOR DELETE
  USING (
    user_has_permission('fornecedores'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Financial Records: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant financial records" ON financial_records;
CREATE POLICY "Tenant users can view their tenant financial records"
  ON financial_records FOR SELECT
  USING (
    is_super_admin()
    OR (
      user_has_permission('financeiro'::text, 'view'::text)
      AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
    )
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant financial records" ON financial_records;
CREATE POLICY "Tenant users can insert their tenant financial records"
  ON financial_records FOR INSERT
  WITH CHECK (
    user_has_permission('financeiro'::text, 'insert'::text)
    AND (created_by = auth.uid())
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant financial records" ON financial_records;
CREATE POLICY "Tenant users can update their tenant financial records"
  ON financial_records FOR UPDATE
  USING (
    user_has_permission('financeiro'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Reconciliations: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant reconciliations" ON reconciliations;
CREATE POLICY "Tenant users can view their tenant reconciliations"
  ON reconciliations FOR SELECT
  USING (
    is_super_admin()
    OR (
      user_has_permission('conciliacoes'::text, 'view'::text)
      AND (user_has_permission('conciliacoes'::text, 'approve'::text) OR (sent_by = auth.uid()))
      AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
    )
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant reconciliations" ON reconciliations;
CREATE POLICY "Tenant users can insert their tenant reconciliations"
  ON reconciliations FOR INSERT
  WITH CHECK (
    user_has_permission('conciliacoes'::text, 'insert'::text)
    AND (sent_by = auth.uid())
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant reconciliations" ON reconciliations;
CREATE POLICY "Tenant users can update their tenant reconciliations"
  ON reconciliations FOR UPDATE
  USING (
    (
      user_has_permission('conciliacoes'::text, 'approve'::text)
      OR (user_has_permission('conciliacoes'::text, 'insert'::text) AND (sent_by = auth.uid()) AND (status = 'pending'::text))
    )
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant reconciliations" ON reconciliations;
CREATE POLICY "Tenant users can delete their tenant reconciliations"
  ON reconciliations FOR DELETE
  USING (
    user_has_permission('conciliacoes'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Accounts Payable: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant accounts payable" ON accounts_payable;
CREATE POLICY "Tenant users can view their tenant accounts payable"
  ON accounts_payable FOR SELECT
  USING (
    is_super_admin()
    OR (
      user_has_permission('contas-pagar'::text, 'view'::text)
      AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
    )
  );

DROP POLICY IF EXISTS "Tenant users can insert their tenant accounts payable" ON accounts_payable;
CREATE POLICY "Tenant users can insert their tenant accounts payable"
  ON accounts_payable FOR INSERT
  WITH CHECK (
    user_has_permission('contas-pagar'::text, 'insert'::text)
    AND (requested_by = auth.uid())
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL)
  );

DROP POLICY IF EXISTS "Tenant users can update their tenant accounts payable" ON accounts_payable;
CREATE POLICY "Tenant users can update their tenant accounts payable"
  ON accounts_payable FOR UPDATE
  USING (
    user_has_permission('contas-pagar'::text, 'edit'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

DROP POLICY IF EXISTS "Tenant users can delete their tenant accounts payable" ON accounts_payable;
CREATE POLICY "Tenant users can delete their tenant accounts payable"
  ON accounts_payable FOR DELETE
  USING (
    user_has_permission('contas-pagar'::text, 'delete'::text)
    AND (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Expense Categories: Adicionar filtro de tenant
DROP POLICY IF EXISTS "Tenant users can view their tenant expense categories" ON expense_categories;
CREATE POLICY "Tenant users can view their tenant expense categories"
  ON expense_categories FOR SELECT
  USING (
    is_active = true
    OR is_super_admin()
    OR (tenant_id = get_user_tenant_id(auth.uid()) OR (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL))
  );

-- Access Profiles: Adicionar filtro de tenant  
DROP POLICY IF EXISTS "Tenant users can view their tenant access profiles" ON access_profiles;
CREATE POLICY "Tenant users can view their tenant access profiles"
  ON access_profiles FOR SELECT
  USING (
    is_super_admin()
    OR (is_active = true AND (tenant_id = get_user_tenant_id(auth.uid()) OR tenant_id IS NULL))
  );