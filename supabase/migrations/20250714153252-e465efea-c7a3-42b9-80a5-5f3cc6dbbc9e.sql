-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL! 
-- Limpar TODOS os dados do sistema, mantendo apenas o admin Vitor Carvalho

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

-- 2. Limpar TODOS os logs primeiro (para remover foreign key constraints)
DELETE FROM public.approval_audit_logs;
DELETE FROM public.audit_logs;

-- 3. Remover todos os registros dependentes
DELETE FROM public.event_registrations;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;
DELETE FROM public.church_events;
DELETE FROM public.notifications;
DELETE FROM public.video_library;

-- 4. Remover todos os membros
DELETE FROM public.members;

-- 5. Remover todos os perfis exceto o admin
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. Remover todos os usuários da autenticação exceto o admin
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