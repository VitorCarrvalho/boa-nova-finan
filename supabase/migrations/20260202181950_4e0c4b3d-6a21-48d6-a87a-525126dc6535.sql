-- 1. Corrigir confirmation_token do usuário super admin
UPDATE auth.users 
SET confirmation_token = ''
WHERE email = 'superadmin@gmail.com' AND confirmation_token IS NULL;

-- 2. Corrigir políticas RLS da tabela tenant_admins para evitar recursão infinita
-- Remover políticas existentes
DROP POLICY IF EXISTS "Super admins can manage tenant admins" ON public.tenant_admins;
DROP POLICY IF EXISTS "Tenant admins can view their own tenant" ON public.tenant_admins;

-- Criar políticas sem recursão
CREATE POLICY "Super admins can manage tenant admins"
ON public.tenant_admins
FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their tenant admin status"
ON public.tenant_admins
FOR SELECT
USING (user_id = auth.uid());