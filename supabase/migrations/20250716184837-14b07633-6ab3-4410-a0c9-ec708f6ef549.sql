-- Remove existing RLS policies for church_events
DROP POLICY IF EXISTS "Admins e pastors podem gerenciar eventos" ON public.church_events;
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver eventos" ON public.church_events;

-- Create new granular permission-based policies for church_events
CREATE POLICY "Usuários com permissão podem ver eventos"
ON public.church_events
FOR SELECT
TO authenticated
USING (user_has_permission('eventos', 'view'));

CREATE POLICY "Usuários com permissão podem criar eventos"
ON public.church_events
FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('eventos', 'insert'));

CREATE POLICY "Usuários com permissão podem atualizar eventos"
ON public.church_events
FOR UPDATE
TO authenticated
USING (user_has_permission('eventos', 'edit'));

CREATE POLICY "Usuários com permissão podem deletar eventos"
ON public.church_events
FOR DELETE
TO authenticated
USING (user_has_permission('eventos', 'delete'));