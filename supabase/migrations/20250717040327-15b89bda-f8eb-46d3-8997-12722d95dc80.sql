-- ⚠️ LIMPEZA COMPLETA PARA IMPLANTAÇÃO - ABORDAGEM SIMPLIFICADA ⚠️
-- Esta operação remove todos os dados de teste, mantendo apenas o admin Vitor Carvalho
-- ID do admin: 66d14607-0219-45bb-b099-83dd6d4a6a17

-- 1. Temporariamente modificar a função log_changes para lidar com user_id nulo
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

-- 2. LIMPEZA DIRETA DOS DADOS (excluindo tabelas que podem ter constraints problema)
-- Primeiro: Remover dados independentes
DELETE FROM public.attachment_downloads 
WHERE downloaded_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.accounts_payable_approvals;
DELETE FROM public.event_registrations;
DELETE FROM public.notifications;
DELETE FROM public.accounts_payable;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;
DELETE FROM public.church_events;

DELETE FROM public.video_library 
WHERE created_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 3. Limpar logs de auditoria (exceto do admin)
DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 4. Limpar aprovações de auditoria PRIMEIRO (para remover referências)
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 5. Agora remover perfis de usuários (exceto admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. Por último, remover usuários de auth (exceto admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 7. Restaurar a função log_changes original
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