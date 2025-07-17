-- ⚠️ LIMPEZA COMPLETA PARA IMPLANTAÇÃO - VERSÃO CORRIGIDA ⚠️
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

-- 2. LIMPEZA DE LOGS E AUDITORIA
DELETE FROM public.attachment_downloads 
WHERE downloaded_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 3. LIMPEZA DE TRANSAÇÕES E PROCESSOS
DELETE FROM public.accounts_payable_approvals;
DELETE FROM public.accounts_payable;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;

-- 4. LIMPEZA DE EVENTOS
DELETE FROM public.event_registrations;
DELETE FROM public.church_events;
DELETE FROM public.notifications;

-- 5. LIMPEZA DA BIBLIOTECA DE VÍDEOS
DELETE FROM public.video_library 
WHERE created_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. LIMPEZA DE DADOS MESTRES
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 7. LIMPEZA FINAL DE USUÁRIOS
-- Remover perfis de usuários de teste (exceto o admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Remover usuários de autenticação (exceto o admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 8. Restaurar a função log_changes original
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