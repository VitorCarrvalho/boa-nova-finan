
-- Reset completo das políticas RLS para pedidos_oracao
-- Desabilitar temporariamente RLS
ALTER TABLE public.pedidos_oracao DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Apenas admins podem ver pedidos" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Qualquer pessoa pode inserir pedidos de oração" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Apenas admins podem ver pedidos de oração" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Usuários anônimos podem inserir pedidos" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir pedidos" ON public.pedidos_oracao;

-- Reabilitar RLS
ALTER TABLE public.pedidos_oracao ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais específicas e diretas
-- Política para usuários anônimos (não autenticados)
CREATE POLICY "Anon users can insert prayer requests"
ON public.pedidos_oracao
FOR INSERT
TO anon
WITH CHECK (true);

-- Política para usuários autenticados
CREATE POLICY "Authenticated users can insert prayer requests"
ON public.pedidos_oracao
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para SELECT apenas para admins
CREATE POLICY "Only admins can view prayer requests"
ON public.pedidos_oracao
FOR SELECT
TO authenticated
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));
