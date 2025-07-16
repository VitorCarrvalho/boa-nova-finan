-- Corrigir perfil "Eventos" para ficar ativo
UPDATE public.access_profiles 
SET is_active = true 
WHERE name = 'Eventos';

-- Remover a política de UPDATE atual que é muito permissiva
DROP POLICY IF EXISTS "Usuários com permissão podem editar conciliações" ON public.reconciliations;

-- Criar duas políticas específicas para UPDATE:
-- 1. Usuários podem editar suas próprias conciliações pendentes (dados apenas)
CREATE POLICY "Usuários podem editar suas próprias conciliações pendentes" ON public.reconciliations
  FOR UPDATE
  USING (
    user_has_permission('conciliacoes'::text, 'insert'::text) AND 
    sent_by = auth.uid() AND 
    status = 'pending'
  );

-- 2. Usuários com permissão de aprovar podem alterar status de qualquer conciliação
CREATE POLICY "Usuários com permissão podem aprovar/rejeitar conciliações" ON public.reconciliations
  FOR UPDATE  
  USING (
    user_has_permission('conciliacoes'::text, 'approve'::text)
  );