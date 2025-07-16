-- Garantir que todos os perfis tenham acesso ao dashboard
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object('dashboard', jsonb_build_object('view', true))
WHERE NOT (permissions ? 'dashboard') OR NOT (permissions->'dashboard' ? 'view');

-- Verificar se há perfil "Eventos" sem acesso ao dashboard e corrigir
UPDATE public.access_profiles 
SET permissions = permissions || jsonb_build_object('dashboard', jsonb_build_object('view', true))
WHERE name = 'Eventos' AND (NOT (permissions ? 'dashboard') OR NOT (permissions->'dashboard'->>'view' = 'true'));