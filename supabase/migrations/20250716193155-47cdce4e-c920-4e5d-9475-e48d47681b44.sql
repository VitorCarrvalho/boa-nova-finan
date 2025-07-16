-- Criar política para permitir usuários não autenticados visualizarem congregações ativas durante o cadastro
CREATE POLICY "Unauthenticated users can view active congregations for registration"
ON public.congregations
FOR SELECT
TO anon
USING (is_active = true);