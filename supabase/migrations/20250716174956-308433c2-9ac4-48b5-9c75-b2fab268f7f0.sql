-- Atualizar permissões do perfil Admin para incluir configuracoes e gestao-acessos
UPDATE access_profiles 
SET permissions = permissions || 
  jsonb_build_object(
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
WHERE name = 'Admin' AND is_active = true;