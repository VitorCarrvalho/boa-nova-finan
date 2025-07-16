-- FASE 3 (CONTINUAÇÃO): Atualizar políticas RLS para reconciliations e suppliers

-- ==================== RECONCILIATIONS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Finance e admins podem gerenciar conciliações" ON public.reconciliations;
DROP POLICY IF EXISTS "Usuários podem ver conciliações de suas congregações" ON public.reconciliations;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar conciliações"
ON public.reconciliations
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('conciliacoes', 'insert'));

CREATE POLICY "Usuários com permissão podem ver conciliações"
ON public.reconciliations
FOR SELECT
TO authenticated
USING (user_has_permission('conciliacoes', 'view'));

CREATE POLICY "Usuários com permissão podem editar conciliações"
ON public.reconciliations
FOR UPDATE
TO authenticated
USING (user_has_permission('conciliacoes', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar conciliações"
ON public.reconciliations
FOR DELETE
TO authenticated
USING (user_has_permission('conciliacoes', 'delete'));

-- ==================== SUPPLIERS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Finance, admin e superadmin podem gerenciar fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Finance, admin e superadmin podem ver fornecedores" ON public.suppliers;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar fornecedores"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('fornecedores', 'insert'));

CREATE POLICY "Usuários com permissão podem ver fornecedores"
ON public.suppliers
FOR SELECT
TO authenticated
USING (user_has_permission('fornecedores', 'view'));

CREATE POLICY "Usuários com permissão podem editar fornecedores"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (user_has_permission('fornecedores', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar fornecedores"
ON public.suppliers
FOR DELETE
TO authenticated
USING (user_has_permission('fornecedores', 'delete'));

-- ==================== ACCOUNTS_PAYABLE_APPROVALS ====================
-- Atualizar políticas para accounts_payable_approvals também
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Aprovadores podem inserir aprovações" ON public.accounts_payable_approvals;
DROP POLICY IF EXISTS "Usuários podem ver aprovações de contas que têm acesso" ON public.accounts_payable_approvals;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar aprovações"
ON public.accounts_payable_approvals
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('contas-pagar', 'approve') AND approved_by = auth.uid());

CREATE POLICY "Usuários com permissão podem ver aprovações"
ON public.accounts_payable_approvals
FOR SELECT
TO authenticated
USING (user_has_permission('contas-pagar', 'view'));