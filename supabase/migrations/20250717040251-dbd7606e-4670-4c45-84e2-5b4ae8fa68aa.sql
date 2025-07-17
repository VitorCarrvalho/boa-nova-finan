-- ⚠️ LIMPEZA COMPLETA PARA IMPLANTAÇÃO - VERSÃO FINAL ⚠️
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

-- 2. Desabilitar triggers temporariamente para evitar conflitos
ALTER TABLE public.approval_audit_logs DISABLE TRIGGER ALL;
ALTER TABLE public.audit_logs DISABLE TRIGGER ALL;
ALTER TABLE public.accounts_payable DISABLE TRIGGER ALL;
ALTER TABLE public.financial_records DISABLE TRIGGER ALL;
ALTER TABLE public.reconciliations DISABLE TRIGGER ALL;
ALTER TABLE public.church_events DISABLE TRIGGER ALL;
ALTER TABLE public.members DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;

-- 3. LIMPEZA ORDENADA POR DEPENDÊNCIAS
-- Primeiro: Dados sem dependências externas
DELETE FROM public.attachment_downloads 
WHERE downloaded_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.accounts_payable_approvals;
DELETE FROM public.event_registrations;
DELETE FROM public.notifications;

-- Segundo: Remover logs de auditoria
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Terceiro: Transações principais
DELETE FROM public.accounts_payable;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;

-- Quarto: Eventos
DELETE FROM public.church_events;

-- Quinto: Biblioteca de vídeos
DELETE FROM public.video_library 
WHERE created_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Sexto: Membros de teste
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- Sétimo: Perfis de usuários de teste
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Oitavo: Usuários de autenticação de teste
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 4. Reabilitar todos os triggers
ALTER TABLE public.approval_audit_logs ENABLE TRIGGER ALL;
ALTER TABLE public.audit_logs ENABLE TRIGGER ALL;
ALTER TABLE public.accounts_payable ENABLE TRIGGER ALL;
ALTER TABLE public.financial_records ENABLE TRIGGER ALL;
ALTER TABLE public.reconciliations ENABLE TRIGGER ALL;
ALTER TABLE public.church_events ENABLE TRIGGER ALL;
ALTER TABLE public.members ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;

-- 5. Restaurar a função log_changes original
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