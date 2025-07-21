
-- Remover todas as políticas existentes da tabela pedidos_oracao
DROP POLICY IF EXISTS "Apenas admins podem ver pedidos de oração" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Usuários anônimos podem inserir pedidos" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir pedidos" ON public.pedidos_oracao;

-- Criar política universal para INSERT (sem distinção de role)
CREATE POLICY "Qualquer pessoa pode inserir pedidos de oração"
ON public.pedidos_oracao
FOR INSERT
WITH CHECK (true);

-- Manter política de SELECT apenas para admins
CREATE POLICY "Apenas admins podem ver pedidos"
ON public.pedidos_oracao
FOR SELECT
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));
