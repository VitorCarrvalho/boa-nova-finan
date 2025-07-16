-- Corrigir perfil do usuário Suporte para usar o perfil "Eventos" correto
UPDATE public.profiles 
SET profile_id = '08ac1f0b-56cc-4b1e-b987-5959c1046ca3'
WHERE email = 'suporteiptm@gmail.com' AND profile_id = 'a264bc89-1762-49c1-bb2e-da56fb190168';

-- Remover o perfil "Eventos" duplicado/incorreto
DELETE FROM public.access_profiles 
WHERE id = 'a264bc89-1762-49c1-bb2e-da56fb190168' AND name = 'Eventos';