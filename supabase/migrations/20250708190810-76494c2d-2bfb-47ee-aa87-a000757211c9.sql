-- Adicionar coluna profile_id à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN profile_id UUID REFERENCES public.access_profiles(id);

-- Criar perfis padrão se não existirem
INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'Admin', 'Perfil de administrador com acesso total ao sistema', '{
  "dashboard": {"view": true, "insert": true, "edit": true, "delete": true},
  "financeiro": {"view": true, "insert": true, "edit": true, "delete": true},
  "membros": {"view": true, "insert": true, "edit": true, "delete": true},
  "eventos": {"view": true, "insert": true, "edit": true, "delete": true},
  "congregacoes": {"view": true, "insert": true, "edit": true, "delete": true},
  "ministerios": {"view": true, "insert": true, "edit": true, "delete": true},
  "departamentos": {"view": true, "insert": true, "edit": true, "delete": true},
  "fornecedores": {"view": true, "insert": true, "edit": true, "delete": true},
  "relatorios": {"view": true, "insert": true, "edit": true, "delete": true},
  "notificacoes": {"view": true, "insert": true, "edit": true, "delete": true},
  "conciliacoes": {"view": true, "insert": true, "edit": true, "delete": true}
}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'Admin');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'Pastor', 'Perfil de pastor com acesso a gestão da congregação', '{
  "dashboard": {"view": true, "insert": false, "edit": false, "delete": false},
  "financeiro": {"view": false, "insert": false, "edit": false, "delete": false},
  "membros": {"view": true, "insert": true, "edit": true, "delete": false},
  "eventos": {"view": true, "insert": true, "edit": true, "delete": false},
  "congregacoes": {"view": true, "insert": true, "edit": true, "delete": false},
  "ministerios": {"view": true, "insert": true, "edit": true, "delete": false},
  "departamentos": {"view": true, "insert": true, "edit": true, "delete": false},
  "fornecedores": {"view": false, "insert": false, "edit": false, "delete": false},
  "relatorios": {"view": true, "insert": false, "edit": false, "delete": false},
  "notificacoes": {"view": false, "insert": false, "edit": false, "delete": false},
  "conciliacoes": {"view": true, "insert": true, "edit": true, "delete": false}
}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'Pastor');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'Gerente Financeiro', 'Perfil financeiro com acesso a dados financeiros', '{
  "dashboard": {"view": true, "insert": false, "edit": false, "delete": false},
  "financeiro": {"view": true, "insert": true, "edit": true, "delete": false},
  "membros": {"view": false, "insert": false, "edit": false, "delete": false},
  "eventos": {"view": false, "insert": false, "edit": false, "delete": false},
  "congregacoes": {"view": false, "insert": false, "edit": false, "delete": false},
  "ministerios": {"view": false, "insert": false, "edit": false, "delete": false},
  "departamentos": {"view": false, "insert": false, "edit": false, "delete": false},
  "fornecedores": {"view": true, "insert": true, "edit": true, "delete": false},
  "relatorios": {"view": true, "insert": false, "edit": false, "delete": false},
  "notificacoes": {"view": false, "insert": false, "edit": false, "delete": false},
  "conciliacoes": {"view": true, "insert": true, "edit": true, "delete": false}
}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'Gerente Financeiro');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'Membro', 'Perfil de membro com acesso básico', '{
  "dashboard": {"view": true, "insert": false, "edit": false, "delete": false},
  "financeiro": {"view": false, "insert": false, "edit": false, "delete": false},
  "membros": {"view": true, "insert": false, "edit": false, "delete": false},
  "eventos": {"view": true, "insert": false, "edit": false, "delete": false},
  "congregacoes": {"view": true, "insert": false, "edit": false, "delete": false},
  "ministerios": {"view": true, "insert": false, "edit": false, "delete": false},
  "departamentos": {"view": true, "insert": false, "edit": false, "delete": false},
  "fornecedores": {"view": false, "insert": false, "edit": false, "delete": false},
  "relatorios": {"view": false, "insert": false, "edit": false, "delete": false},
  "notificacoes": {"view": false, "insert": false, "edit": false, "delete": false},
  "conciliacoes": {"view": false, "insert": false, "edit": false, "delete": false}
}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'Membro');

-- Migrar dados existentes do role para profile_id
UPDATE public.profiles 
SET profile_id = (
  SELECT id FROM public.access_profiles 
  WHERE name = CASE 
    WHEN profiles.role = 'admin' THEN 'Admin'
    WHEN profiles.role = 'superadmin' THEN 'Admin'
    WHEN profiles.role = 'pastor' THEN 'Pastor'
    WHEN profiles.role = 'finance' THEN 'Gerente Financeiro'
    ELSE 'Membro'
  END
  LIMIT 1
)
WHERE profile_id IS NULL;

-- Dropar função existente get_current_user_role
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Recriar função get_current_user_role com novo tipo de retorno
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.name IS NOT NULL THEN ap.name
      ELSE 'Membro'
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Criar função para obter permissões do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_permissions()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' THEN COALESCE(ap.permissions, '{}'::jsonb)
      ELSE '{}'::jsonb
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Criar função para verificar permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(
  _module text,
  _action text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' THEN 
        COALESCE((ap.permissions -> _module ->> _action)::boolean, false)
      ELSE false
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _default_profile_id UUID;
BEGIN
  -- Get default profile ID (Membro)
  SELECT id INTO _default_profile_id 
  FROM public.access_profiles 
  WHERE name = 'Membro' AND is_active = true
  LIMIT 1;

  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status, profile_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'em_analise',
    _default_profile_id
  );
  RETURN NEW;
END;
$$;