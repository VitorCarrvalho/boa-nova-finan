-- Remover policy atual que permite ver todas as conciliações
DROP POLICY IF EXISTS "Usuários com permissão podem ver conciliações" ON public.reconciliations;

-- Criar policy mais restritiva que permite:
-- 1. Usuários com permissão de aprovar vejam todas as conciliações
-- 2. Usuários sem permissão de aprovar vejam apenas suas próprias conciliações
CREATE POLICY "Usuários podem ver conciliações baseado em permissões" ON public.reconciliations
  FOR SELECT
  USING (
    user_has_permission('conciliacoes'::text, 'view'::text) AND (
      user_has_permission('conciliacoes'::text, 'approve'::text) OR
      sent_by = auth.uid()
    )
  );