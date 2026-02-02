-- =============================================
-- FASE 1: INFRAESTRUTURA MULTI-TENANT COMPLETA
-- =============================================

-- 1.1 Criar ENUMs para tenants
CREATE TYPE public.tenant_plan_type AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE public.tenant_subscription_status AS ENUM ('pending', 'trial', 'active', 'suspended', 'cancelled');
CREATE TYPE public.tenant_admin_role AS ENUM ('owner', 'admin', 'manager');

-- 1.2 Criar tabela principal de tenants
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  plan_type tenant_plan_type NOT NULL DEFAULT 'free',
  subscription_status tenant_subscription_status NOT NULL DEFAULT 'pending',
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 1.3 Criar tabela de configurações do tenant
CREATE TABLE public.tenant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(tenant_id, category)
);

-- 1.4 Criar tabela de administradores do tenant
CREATE TABLE public.tenant_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_admin_role NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(tenant_id, user_id)
);

-- 1.5 Criar tabela de super admins
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 1.6 Adicionar coluna tenant_id em profiles (ANTES das funções)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- =============================================
-- FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- =============================================

-- Função para verificar se é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = _user_id
  );
$$;

-- Função para obter tenant_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid DEFAULT auth.uid())
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id;
$$;

-- Função para verificar se usuário é admin do tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid DEFAULT auth.uid(), _tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_admins 
    WHERE user_id = _user_id 
    AND (_tenant_id IS NULL OR tenant_id = _tenant_id)
    AND role IN ('owner', 'admin')
  );
$$;

-- Função para verificar se usuário pertence ao tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id uuid DEFAULT auth.uid(), _tenant_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
    AND (_tenant_id IS NULL OR tenant_id = _tenant_id)
  );
$$;

-- =============================================
-- HABILITAR RLS NAS NOVAS TABELAS
-- =============================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS RLS PARA TENANTS
-- =============================================

CREATE POLICY "Super admins can manage all tenants"
ON public.tenants FOR ALL
USING (public.is_super_admin());

CREATE POLICY "Tenant admins can view their tenant"
ON public.tenants FOR SELECT
USING (id IN (SELECT tenant_id FROM public.tenant_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their tenant"
ON public.tenants FOR SELECT
USING (id = public.get_user_tenant_id());

CREATE POLICY "Public can view active tenants"
ON public.tenants FOR SELECT
USING (is_active = true AND subscription_status = 'active');

-- =============================================
-- POLÍTICAS RLS PARA TENANT_SETTINGS
-- =============================================

CREATE POLICY "Super admins can manage all tenant settings"
ON public.tenant_settings FOR ALL
USING (public.is_super_admin());

CREATE POLICY "Tenant admins can manage their settings"
ON public.tenant_settings FOR ALL
USING (tenant_id IN (SELECT ta.tenant_id FROM public.tenant_admins ta WHERE ta.user_id = auth.uid()));

CREATE POLICY "Users can view their tenant settings"
ON public.tenant_settings FOR SELECT
USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Public can view public tenant settings"
ON public.tenant_settings FOR SELECT
USING (
  category IN ('branding', 'home')
  AND tenant_id IN (SELECT id FROM public.tenants WHERE is_active = true AND subscription_status = 'active')
);

-- =============================================
-- POLÍTICAS RLS PARA TENANT_ADMINS
-- =============================================

CREATE POLICY "Super admins can manage all tenant admins"
ON public.tenant_admins FOR ALL
USING (public.is_super_admin());

CREATE POLICY "Tenant owners can manage their admins"
ON public.tenant_admins FOR ALL
USING (tenant_id IN (SELECT ta.tenant_id FROM public.tenant_admins ta WHERE ta.user_id = auth.uid() AND ta.role = 'owner'));

CREATE POLICY "Tenant admins can view their admins"
ON public.tenant_admins FOR SELECT
USING (tenant_id IN (SELECT ta.tenant_id FROM public.tenant_admins ta WHERE ta.user_id = auth.uid()));

-- =============================================
-- POLÍTICAS RLS PARA SUPER_ADMINS
-- =============================================

CREATE POLICY "Only super admins can manage super admins"
ON public.super_admins FOR ALL
USING (public.is_super_admin());

-- =============================================
-- TRIGGERS E ÍNDICES
-- =============================================

CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
BEFORE UPDATE ON public.tenant_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON public.tenants(is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON public.tenant_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_category ON public.tenant_settings(category);
CREATE INDEX IF NOT EXISTS idx_tenant_admins_tenant_id ON public.tenant_admins(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_admins_user_id ON public.tenant_admins(user_id);