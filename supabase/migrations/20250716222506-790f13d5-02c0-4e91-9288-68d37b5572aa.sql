-- Ajustar permissões do perfil "Eventos" para conciliações
UPDATE public.access_profiles 
SET permissions = jsonb_set(
  jsonb_set(permissions, '{conciliacoes,view}', 'true'),
  '{conciliacoes,insert}', 'true'
)
WHERE name = 'Eventos' AND id = '08ac1f0b-56cc-4b1e-b987-5959c1046ca3';