-- Correção completa dos perfis de acesso para o módulo contas-pagar

-- 1. ATIVAR O PERFIL PRESIDENTE
UPDATE public.access_profiles 
SET is_active = true
WHERE name = 'Presidente';

-- 2. REMOVER PERFIS DUPLICADOS (MANTER APENAS "Gerente Financeiro")
DELETE FROM public.access_profiles 
WHERE name = 'Gerente Finanaceiro' AND is_active = false;

-- 3. CRIAR PERFIL ASSISTENTE
INSERT INTO public.access_profiles (name, description, is_active, permissions)
VALUES (
  'Assistente',
  'Perfil para assistentes administrativos',
  true,
  jsonb_build_object(
    'dashboard', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false),
    'contas-pagar', jsonb_build_object('view', true, 'insert', true, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'congregacoes', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'membros', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'ministerios', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'departamentos', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'eventos', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false, 'export', false),
    'financeiro', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false),
    'fornecedores', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'conciliacoes', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false, 'approve', false, 'export', false),
    'relatorios', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false),
    'notificacoes', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false),
    'configuracoes', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false),
    'gestao-acessos', jsonb_build_object('view', false, 'insert', false, 'edit', false, 'delete', false)
  )
)
ON CONFLICT (name) DO NOTHING;

-- 4. CRIAR PERFIL DIRETOR  
INSERT INTO public.access_profiles (name, description, is_active, permissions)
VALUES (
  'Diretor',
  'Perfil para diretores com poder de aprovação nível 2',
  true,
  jsonb_build_object(
    'dashboard', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false),
    'contas-pagar', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', true, 'export', true),
    'congregacoes', jsonb_build_object('view', true, 'insert', false, 'edit', true, 'delete', false, 'approve', false, 'export', true),
    'membros', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', true, 'export', true),
    'ministerios', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', false, 'export', true),
    'departamentos', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', false, 'export', true),
    'eventos', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', true, 'export', true),
    'financeiro', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false),
    'fornecedores', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', false, 'export', true),
    'conciliacoes', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false, 'approve', true, 'export', true),
    'relatorios', jsonb_build_object('view', true, 'insert', false, 'edit', false, 'delete', false),
    'notificacoes', jsonb_build_object('view', true, 'insert', true, 'edit', true, 'delete', false),
    'configuracoes', jsonb_build_object('view', true, 'insert', false, 'edit', true, 'delete', false),
    'gestao-acessos', jsonb_build_object('view', true, 'insert', false, 'edit', true, 'delete', false)
  )
)
ON CONFLICT (name) DO NOTHING;

-- 5. CORRIGIR PERMISSÕES DO PERFIL ANALISTA PARA CONTAS-PAGAR
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  )
)
WHERE name = 'Analista';

-- 6. ATUALIZAR PERMISSÕES DO PERFIL PRESIDENTE PARA CONTAS-PAGAR
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'congregacoes', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', true,
    'delete', false,
    'approve', true,
    'export', true
  ),
  'membros', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', true,
    'export', true
  ),
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'departamentos', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'eventos', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'export', true
  ),
  'fornecedores', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'notificacoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false
  ),
  'configuracoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true
  ),
  'gestao-acessos', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true
  )
)
WHERE name = 'Presidente';