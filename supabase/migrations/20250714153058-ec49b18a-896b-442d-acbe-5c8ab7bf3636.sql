-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL! 
-- Limpar dados do sistema, mantendo apenas o admin Vitor Carvalho
-- Incluindo limpeza de todas as referências foreign key

-- 1. Modificar temporariamente a função log_changes para aceitar null user_id
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value)
    VALUES (COALESCE(auth.uid(), '66d14607-0219-45bb-b099-83dd6d4a6a17'), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value, new_value)
    VALUES (COALESCE(auth.uid(), '66d14607-0219-45bb-b099-83dd6d4a6a17'), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, new_value)
    VALUES (COALESCE(auth.uid(), '66d14607-0219-45bb-b099-83dd6d4a6a17'), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Remover registros dependentes primeiro
DELETE FROM public.event_registrations;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations WHERE congregation_id != (SELECT congregation_id FROM public.profiles WHERE id = '66d14607-0219-45bb-b099-83dd6d4a6a17');
DELETE FROM public.church_events WHERE organizer_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';
DELETE FROM public.notifications WHERE created_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 3. Remover logs de auditoria
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 4. Agora remover membros
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 5. Remover perfis de usuário (exceto do admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. Por último, remover usuários da autenticação (exceto o admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 7. Restaurar a função original
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value, new_value)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, new_value)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;