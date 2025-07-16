-- FASE 2: Atualizar políticas RLS para accounts_payable e financial_records

-- ==================== ACCOUNTS_PAYABLE ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Perfis autorizados podem criar contas" ON public.accounts_payable;
DROP POLICY IF EXISTS "Usuários podem ver contas de suas congregações ou que solici" ON public.accounts_payable;
DROP POLICY IF EXISTS "Criador ou aprovadores podem atualizar contas" ON public.accounts_payable;
DROP POLICY IF EXISTS "Apenas superadmins podem deletar contas" ON public.accounts_payable;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar contas a pagar"
ON public.accounts_payable
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('contas-pagar', 'insert') AND requested_by = auth.uid());

CREATE POLICY "Usuários com permissão podem ver contas a pagar"
ON public.accounts_payable
FOR SELECT
TO authenticated
USING (user_has_permission('contas-pagar', 'view'));

CREATE POLICY "Usuários com permissão podem editar contas a pagar"
ON public.accounts_payable
FOR UPDATE
TO authenticated
USING (user_has_permission('contas-pagar', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar contas a pagar"
ON public.accounts_payable
FOR DELETE
TO authenticated
USING (user_has_permission('contas-pagar', 'delete'));

-- ==================== FINANCIAL_RECORDS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Finance, admin e superadmin podem inserir registros financeiros" ON public.financial_records;
DROP POLICY IF EXISTS "Finance, admin e superadmin podem ver registros financeiros" ON public.financial_records;
DROP POLICY IF EXISTS "Finance, admin e superadmin podem atualizar registros financeir" ON public.financial_records;
DROP POLICY IF EXISTS "Apenas superadmins podem deletar registros financeiros" ON public.financial_records;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar registros financeiros"
ON public.financial_records
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('financeiro', 'insert') AND created_by = auth.uid());

CREATE POLICY "Usuários com permissão podem ver registros financeiros"
ON public.financial_records
FOR SELECT
TO authenticated
USING (user_has_permission('financeiro', 'view'));

CREATE POLICY "Usuários com permissão podem editar registros financeiros"
ON public.financial_records
FOR UPDATE
TO authenticated
USING (user_has_permission('financeiro', 'edit'));

-- Manter regra especial para DELETE apenas para superadmin
CREATE POLICY "Apenas superadmins podem deletar registros financeiros"
ON public.financial_records
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'superadmin'::user_role);