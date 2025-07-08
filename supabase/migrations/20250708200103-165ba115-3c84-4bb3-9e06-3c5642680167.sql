-- ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL! 
-- Limpar dados do sistema, mantendo apenas o admin Vitor Carvalho
-- Ordem correta para respeitar foreign keys

-- 1. Primeiro remover registros dependentes
DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 2. Remover logs de auditoria (exceto do admin)
DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 3. Remover membros primeiro (não têm dependências diretas)
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- 4. Remover perfis de usuário (exceto do admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 5. Por último, remover usuários da autenticação (exceto o admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';