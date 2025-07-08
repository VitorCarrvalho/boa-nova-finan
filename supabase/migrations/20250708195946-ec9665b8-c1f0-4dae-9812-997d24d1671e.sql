-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL! 
-- Limpar dados do sistema, mantendo apenas o admin Vitor Carvalho

-- 1. Desabilitar triggers temporariamente para evitar conflitos
ALTER TABLE public.members DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.approval_audit_logs DISABLE TRIGGER ALL;

-- 2. Remover logs de auditoria de aprovação (exceto do admin)
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 3. Remover logs de auditoria geral (exceto do admin)
DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 4. Remover membros (não relacionados ao admin)
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 5. Remover perfis de usuário (exceto do admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. Remover usuários da autenticação (exceto o admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 7. Reabilitar triggers
ALTER TABLE public.members ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.approval_audit_logs ENABLE TRIGGER ALL;