
-- Remove the existing policy that might be causing conflicts
DROP POLICY IF EXISTS "Qualquer um pode inserir pedidos de oração" ON public.pedidos_oracao;

-- Create specific policy for anonymous users
CREATE POLICY "Usuários anônimos podem inserir pedidos"
ON public.pedidos_oracao
FOR INSERT
TO anon
WITH CHECK (true);

-- Create specific policy for authenticated users
CREATE POLICY "Usuários autenticados podem inserir pedidos"
ON public.pedidos_oracao
FOR INSERT
TO authenticated
WITH CHECK (true);
