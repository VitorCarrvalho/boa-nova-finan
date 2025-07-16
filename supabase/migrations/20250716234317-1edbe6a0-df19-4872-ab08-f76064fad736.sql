-- Criar permissões granulares para submódulos de contas a pagar
UPDATE public.access_profiles SET permissions = jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'paid_accounts', jsonb_build_object('view', false, 'export', false),
  'pending_approval', jsonb_build_object('view', false),
  'authorize_accounts', jsonb_build_object('view', false, 'approve', false),
  'approved_accounts', jsonb_build_object('view', false, 'export', false),
  'new_account', jsonb_build_object('view', false, 'insert', false)
) WHERE name = 'Analista';

-- Analista: apenas incluir nova conta
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Analista';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{contas-pagar}', 
  jsonb_build_object('insert', true)
) WHERE name = 'Analista';

-- Assistente: nova conta + pendentes + aprovadas  
UPDATE public.access_profiles SET permissions = jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'paid_accounts', jsonb_build_object('view', false, 'export', false),
  'pending_approval', jsonb_build_object('view', true),
  'authorize_accounts', jsonb_build_object('view', false, 'approve', false),
  'approved_accounts', jsonb_build_object('view', true, 'export', false),
  'new_account', jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Assistente';

-- Pastor: nova conta + pendentes + aprovadas
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{paid_accounts}', 
  jsonb_build_object('view', false, 'export', false)
) WHERE name = 'Pastor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{pending_approval}', 
  jsonb_build_object('view', true)
) WHERE name = 'Pastor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{authorize_accounts}', 
  jsonb_build_object('view', false, 'approve', false)
) WHERE name = 'Pastor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{approved_accounts}', 
  jsonb_build_object('view', true, 'export', false)
) WHERE name = 'Pastor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Pastor';

-- Gerente Financeiro: todas menos autorização específica de nível
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{paid_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Gerente Financeiro';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{pending_approval}', 
  jsonb_build_object('view', true)
) WHERE name = 'Gerente Financeiro';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{authorize_accounts}', 
  jsonb_build_object('view', true, 'approve', true)
) WHERE name = 'Gerente Financeiro';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{approved_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Gerente Financeiro';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Gerente Financeiro';

-- Diretor: todas as permissões
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{paid_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Diretor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{pending_approval}', 
  jsonb_build_object('view', true)
) WHERE name = 'Diretor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{authorize_accounts}', 
  jsonb_build_object('view', true, 'approve', true)
) WHERE name = 'Diretor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{approved_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Diretor';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Diretor';

-- Presidente: todas as permissões
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{paid_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Presidente';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{pending_approval}', 
  jsonb_build_object('view', true)
) WHERE name = 'Presidente';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{authorize_accounts}', 
  jsonb_build_object('view', true, 'approve', true)
) WHERE name = 'Presidente';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{approved_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Presidente';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Presidente';

-- Admin: todas as permissões
UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{paid_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Admin';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{pending_approval}', 
  jsonb_build_object('view', true)
) WHERE name = 'Admin';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{authorize_accounts}', 
  jsonb_build_object('view', true, 'approve', true)
) WHERE name = 'Admin';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{approved_accounts}', 
  jsonb_build_object('view', true, 'export', true)
) WHERE name = 'Admin';

UPDATE public.access_profiles SET permissions = jsonb_set(
  permissions,
  '{new_account}', 
  jsonb_build_object('view', true, 'insert', true)
) WHERE name = 'Admin';