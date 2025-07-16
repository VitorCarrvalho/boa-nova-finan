-- FASE 1: Adicionar módulo "contas-pagar" aos perfis existentes
-- Primeiro, vamos verificar e adicionar o módulo "contas-pagar" aos perfis que não o possuem

-- Atualizar perfil "Admin" para incluir "contas-pagar"
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', true,
    'export', true
  )
)
WHERE name = 'Admin';

-- Atualizar perfil "Pastor" para incluir "contas-pagar"
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', false,
    'export', true
  )
)
WHERE name = 'Pastor';

-- Atualizar perfil "Gerente Financeiro" para incluir "contas-pagar"
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', false,
    'approve', true,
    'export', true
  )
)
WHERE name = 'Gerente Financeiro';

-- Atualizar perfil "Membro" para incluir "contas-pagar" (apenas visualização)
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'contas-pagar', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  )
)
WHERE name = 'Membro';

-- Corrigir permissões do perfil "Eventos" para garantir que tenha acesso correto aos eventos
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object(
  'eventos', jsonb_build_object(
    'view', true,
    'insert', true,
    'edit', true,
    'delete', true,
    'approve', false,
    'export', true
  ),
  'contas-pagar', jsonb_build_object(
    'view', false,
    'insert', false,
    'edit', false,
    'delete', false,
    'approve', false,
    'export', false
  )
)
WHERE name = 'Eventos';