-- ⚠️ LIMPEZA COMPLETA PARA IMPLANTAÇÃO ⚠️
-- Esta operação remove todos os dados de teste, mantendo apenas o admin Vitor Carvalho
-- ID do admin: 66d14607-0219-45bb-b099-83dd6d4a6a17

-- 1. LIMPEZA DE LOGS E AUDITORIA
DELETE FROM public.attachment_downloads 
WHERE downloaded_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.approval_audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17'
   AND changed_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

DELETE FROM public.audit_logs 
WHERE user_id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 2. LIMPEZA DE TRANSAÇÕES E PROCESSOS
DELETE FROM public.accounts_payable_approvals;
DELETE FROM public.accounts_payable;
DELETE FROM public.financial_records;
DELETE FROM public.reconciliations;

-- 3. LIMPEZA DE EVENTOS
DELETE FROM public.event_registrations;
DELETE FROM public.church_events;
DELETE FROM public.notifications;

-- 4. LIMPEZA DE DADOS MESTRES (exceto dados do sistema)
DELETE FROM public.members 
WHERE email != 'vitor.tecc@gmail.com'
   OR email IS NULL;

-- Manter congregações se necessário para o sistema, ou remover todas se forem de teste
-- DELETE FROM public.congregations; -- Descomente se quiser remover todas

-- Limpar ministérios, departamentos e fornecedores de teste se houver
-- DELETE FROM public.ministries; -- Descomente se quiser remover todos
-- DELETE FROM public.departments; -- Descomente se quiser remover todos  
-- DELETE FROM public.suppliers; -- Descomente se quiser remover todos

-- 5. LIMPEZA FINAL DE USUÁRIOS
-- Remover perfis de usuários de teste (exceto o admin)
DELETE FROM public.profiles 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Remover usuários de autenticação (exceto o admin)
DELETE FROM auth.users 
WHERE id != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- 6. LIMPEZA DA BIBLIOTECA DE VÍDEOS (se houver conteúdo de teste)
DELETE FROM public.video_library 
WHERE created_by != '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- NOTA: As seguintes tabelas são mantidas por serem dados do sistema:
-- - access_profiles (perfis de acesso)
-- - expense_categories (categorias de despesa)
-- Estas tabelas contêm configurações essenciais do sistema