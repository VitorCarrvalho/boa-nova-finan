-- FASE 4: Adicionar módulos faltantes aos perfis existentes

-- Atualizar perfil "Admin" para incluir todos os módulos
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'membros', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'congregacoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'departamentos', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'conciliacoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  ),
  'fornecedores', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  )
)
WHERE name = 'Admin';

-- Atualizar perfil "Pastor" para incluir módulos relevantes
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'membros', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', true,
    'export', true
  ),
  'congregacoes', jsonb_build_object(
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
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'conciliacoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'fornecedores', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', true
  )
)
WHERE name = 'Pastor';

-- Atualizar perfil "Gerente Financeiro" para incluir módulos relevantes
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'membros', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'congregacoes', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'departamentos', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', true
  ),
  'conciliacoes', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', true,
    'export', true
  ),
  'fornecedores', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  )
)
WHERE name = 'Gerente Financeiro';

-- Atualizar perfil "Membro" para incluir módulos (apenas visualização limitada)
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'membros', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'congregacoes', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'departamentos', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'conciliacoes', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'fornecedores', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  )
)
WHERE name = 'Membro';

-- Atualizar perfil "Eventos" para incluir módulos relevantes
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'membros', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'congregacoes', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'departamentos', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'ministerios', jsonb_build_object(
    'view', true,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'conciliacoes', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  ),
  'fornecedores', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  )
)
WHERE name = 'Eventos';