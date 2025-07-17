-- ⚠️ LIMPEZA COMPLETA PARA IMPLANTAÇÃO - VERSÃO MAIS SEGURA ⚠️
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

-- 2. PRIMEIRO: Limpar TODAS as tabelas de dados (mantendo apenas estrutura e configs)
DELETE FROM public.attachment_downloads;
DELETE FROM public.accounts_payable_approvals;
DELETE FROM public.event_registrations;
DELETE FROM public.notifications;
DELETE FROM public.accounts_payable;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;
DELETE FROM public.church_events;
DELETE FROM public.video_library;
DELETE FROM public.members;

-- 3. SEGUNDO: Limpar todos os logs de auditoria
DELETE FROM public.audit_logs;
DELETE FROM public.approval_audit_logs;

-- 4. TERCEIRO: Remover todos os perfis exceto o admin
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 5. QUARTO: Remover todos os usuários exceto o admin
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. QUINTO: Recriar o perfil do admin se necessário (garantir que existe)
INSERT INTO public.profiles (
  id, 
  name, 
  email, 
  approval_status, 
  role,
  approved_at,
  approved_by
) VALUES (
  '66d14607-0219-45bb-b099-83dd6d4a6a17',
  'Vitor Carvalho',
  'vitor.tecc@gmail.com',
  'ativo',
  'superadmin',
  now(),
  '66d14607-0219-45bb-b099-83dd6d4a6a17'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  approval_status = EXCLUDED.approval_status,
  role = EXCLUDED.role,
  approved_at = EXCLUDED.approved_at,
  approved_by = EXCLUDED.approved_by;

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