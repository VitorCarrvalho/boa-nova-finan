-- Adicionar permissão de visualizar congregações para o perfil Analista
UPDATE public.access_profiles 
SET permissions = jsonb_set(
    permissions, 
    '{congregacoes,view}', 
    'true'::jsonb
)
WHERE name = 'Analista';

-- Verificar e garantir que outros perfis que podem criar contas a pagar também tenham acesso a congregações
UPDATE public.access_profiles 
SET permissions = jsonb_set(
    permissions, 
    '{congregacoes,view}', 
    'true'::jsonb
)
WHERE name IN ('Assistente', 'Gerente Financeiro', 'Diretor', 'Presidente', 'Admin')
AND (permissions -> 'congregacoes' ->> 'view')::boolean IS NOT TRUE;