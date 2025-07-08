-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL! 
-- Faça backup antes de executar!

-- 1. Remover logs de auditoria de aprovação (exceto do admin)
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 2. Remover logs de auditoria geral (exceto do admin)
DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 3. Remover membros (não relacionados ao admin)
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 4. Remover perfis de usuário (exceto do admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 5. Remover usuários da autenticação (exceto o admin)
-- NOTA: Esta operação deve ser feita por último pois pode afetar as foreign keys
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';