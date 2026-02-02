-- =============================================
-- FASE 4: MIGRAÇÃO DE DADOS EXISTENTES
-- =============================================

-- 1. Criar tenant padrão "IPTM Global" para dados existentes
INSERT INTO public.tenants (
  name,
  slug,
  subdomain,
  is_active,
  plan_type,
  subscription_status
) VALUES (
  'IPTM Global',
  'iptm-global',
  'iptm',
  true,
  'enterprise',
  'active'
) ON CONFLICT DO NOTHING;

-- 2. Criar configurações de branding padrão para IPTM Global
INSERT INTO public.tenant_settings (
  tenant_id,
  category,
  settings
)
SELECT 
  t.id,
  'branding',
  jsonb_build_object(
    'primaryColor', '222.2 47.4% 11.2%',
    'secondaryColor', '210 40% 96.1%',
    'accentColor', '210 40% 96.1%',
    'logoUrl', NULL,
    'faviconUrl', NULL,
    'fontFamily', 'Inter, sans-serif',
    'churchName', 'IPTM Global',
    'tagline', 'Deus não é religião, é relacionamento.'
  )
FROM public.tenants t
WHERE t.slug = 'iptm-global'
ON CONFLICT DO NOTHING;

-- 3. Criar configurações de home padrão para IPTM Global
INSERT INTO public.tenant_settings (
  tenant_id,
  category,
  settings
)
SELECT 
  t.id,
  'home',
  jsonb_build_object(
    'widgets', jsonb_build_object(
      'pastores', true,
      'eventos', true,
      'calendario', true,
      'versiculo', true,
      'mapa', true,
      'instagram', true,
      'oracao', true,
      'conecta', true
    ),
    'widgetOrder', ARRAY['pastores', 'eventos', 'calendario', 'versiculo', 'mapa', 'instagram', 'oracao', 'conecta'],
    'customBanners', '[]'::jsonb
  )
FROM public.tenants t
WHERE t.slug = 'iptm-global'
ON CONFLICT DO NOTHING;

-- 4. Migrar todos os perfis existentes para o tenant IPTM Global
UPDATE public.profiles
SET tenant_id = (
  SELECT id FROM public.tenants WHERE slug = 'iptm-global' LIMIT 1
)
WHERE tenant_id IS NULL;

-- 5. Criar primeiro super admin baseado em usuários admin existentes
-- (Seleciona o primeiro admin ativo como super admin)
INSERT INTO public.super_admins (user_id, created_by)
SELECT 
  p.id,
  p.id
FROM public.profiles p
LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
WHERE p.approval_status = 'ativo'
  AND (p.role = 'admin' OR p.role = 'superadmin' OR ap.name = 'Admin')
  AND NOT EXISTS (
    SELECT 1 FROM public.super_admins sa WHERE sa.user_id = p.id
  )
LIMIT 1;

-- 6. Adicionar o criador do tenant IPTM Global como admin do tenant
INSERT INTO public.tenant_admins (tenant_id, user_id, role)
SELECT 
  t.id,
  sa.user_id,
  'owner'::tenant_admin_role
FROM public.tenants t
CROSS JOIN public.super_admins sa
WHERE t.slug = 'iptm-global'
  AND NOT EXISTS (
    SELECT 1 FROM public.tenant_admins ta 
    WHERE ta.tenant_id = t.id AND ta.user_id = sa.user_id
  )
LIMIT 1;