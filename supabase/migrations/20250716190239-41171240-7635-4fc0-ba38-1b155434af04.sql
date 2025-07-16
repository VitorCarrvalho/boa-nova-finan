-- FASE 3: Atualizar políticas RLS para demais tabelas operacionais

-- ==================== MEMBERS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Pastors e admins podem inserir membros" ON public.members;
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver membros" ON public.members;
DROP POLICY IF EXISTS "Pastors e admins podem atualizar membros" ON public.members;
DROP POLICY IF EXISTS "Apenas superadmins podem deletar membros" ON public.members;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar membros"
ON public.members
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('membros', 'insert'));

CREATE POLICY "Usuários com permissão podem ver membros"
ON public.members
FOR SELECT
TO authenticated
USING (user_has_permission('membros', 'view'));

CREATE POLICY "Usuários com permissão podem editar membros"
ON public.members
FOR UPDATE
TO authenticated
USING (user_has_permission('membros', 'edit'));

-- Manter regra especial para DELETE apenas para superadmin
CREATE POLICY "Apenas superadmins podem deletar membros"
ON public.members
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'superadmin'::user_role);

-- ==================== CONGREGATIONS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Admins e pastors podem gerenciar congregações" ON public.congregations;
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver congregações" ON public.congregations;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar congregações"
ON public.congregations
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('congregacoes', 'insert'));

CREATE POLICY "Usuários com permissão podem ver congregações"
ON public.congregations
FOR SELECT
TO authenticated
USING (user_has_permission('congregacoes', 'view'));

CREATE POLICY "Usuários com permissão podem editar congregações"
ON public.congregations
FOR UPDATE
TO authenticated
USING (user_has_permission('congregacoes', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar congregações"
ON public.congregations
FOR DELETE
TO authenticated
USING (user_has_permission('congregacoes', 'delete'));

-- ==================== DEPARTMENTS ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Admins e pastors podem gerenciar departamentos" ON public.departments;
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver departamentos" ON public.departments;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar departamentos"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('departamentos', 'insert'));

CREATE POLICY "Usuários com permissão podem ver departamentos"
ON public.departments
FOR SELECT
TO authenticated
USING (user_has_permission('departamentos', 'view'));

CREATE POLICY "Usuários com permissão podem editar departamentos"
ON public.departments
FOR UPDATE
TO authenticated
USING (user_has_permission('departamentos', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar departamentos"
ON public.departments
FOR DELETE
TO authenticated
USING (user_has_permission('departamentos', 'delete'));

-- ==================== MINISTRIES ====================
-- Remover políticas antigas baseadas em roles
DROP POLICY IF EXISTS "Admins e pastors podem gerenciar ministérios" ON public.ministries;
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver ministérios" ON public.ministries;

-- Criar novas políticas baseadas em permissões granulares
CREATE POLICY "Usuários com permissão podem criar ministérios"
ON public.ministries
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('ministerios', 'insert'));

CREATE POLICY "Usuários com permissão podem ver ministérios"
ON public.ministries
FOR SELECT
TO authenticated
USING (user_has_permission('ministerios', 'view'));

CREATE POLICY "Usuários com permissão podem editar ministérios"
ON public.ministries
FOR UPDATE
TO authenticated
USING (user_has_permission('ministerios', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar ministérios"
ON public.ministries
FOR DELETE
TO authenticated
USING (user_has_permission('ministerios', 'delete'));