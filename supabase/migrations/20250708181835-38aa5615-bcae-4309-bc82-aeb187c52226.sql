
-- Etapa 1: Adicionar coluna profile_id na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN profile_id UUID REFERENCES public.access_profiles(id);

-- Etapa 2: Criar perfis padrão baseados nos roles existentes se não existirem
INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'admin', 'Perfil de administrador com acesso total ao sistema', '{
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
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'admin');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'superadmin', 'Perfil de super administrador com acesso completo', '{
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
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'superadmin');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'pastor', 'Perfil de pastor com acesso a gestão da congregação', '{
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
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'pastor');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'finance', 'Perfil financeiro com acesso a dados financeiros', '{
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
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'finance');

INSERT INTO public.access_profiles (name, description, permissions, is_active)
SELECT 'membro', 'Perfil de membro com acesso básico', '{
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
WHERE NOT EXISTS (SELECT 1 FROM public.access_profiles WHERE name = 'membro');

-- Etapa 3: Migrar dados existentes do role para profile_id
UPDATE public.profiles 
SET profile_id = (
  SELECT id FROM public.access_profiles 
  WHERE name = profiles.role::text
)
WHERE profile_id IS NULL;

-- Etapa 4: Atualizar função get_current_user_role para usar access_profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.name IS NOT NULL THEN ap.name
      ELSE 'membro'
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid();
$$;

-- Etapa 5: Criar função para obter permissões do usuário atual
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

-- Etapa 6: Criar função para verificar permissão específica
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

-- Etapa 7: Atualizar função approve_user para usar profile_id
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id uuid, 
  _profile_id uuid,
  _congregation_id uuid DEFAULT NULL::uuid, 
  _ministries text[] DEFAULT NULL::text[], 
  _approved_by uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _previous_status TEXT;
  _previous_profile_id UUID;
  _profile_name TEXT;
BEGIN
  -- Get current status and profile_id
  SELECT approval_status, profile_id INTO _previous_status, _previous_profile_id
  FROM public.profiles WHERE id = _user_id;
  
  -- Get profile name for audit log
  SELECT name INTO _profile_name FROM public.access_profiles WHERE id = _profile_id;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    approval_status = 'ativo',
    profile_id = _profile_id,
    congregation_id = _congregation_id,
    ministries = _ministries,
    approved_by = COALESCE(_approved_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  -- Log the approval (using profile name instead of role)
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, congregation_id, ministries
  ) VALUES (
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'ativo',
    NULL, _profile_name::user_role, _congregation_id, _ministries
  );
  
  RETURN TRUE;
END;
$$;

-- Etapa 8: Atualizar função handle_new_user para usar profile padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _default_profile_id UUID;
BEGIN
  -- Get default profile ID (membro)
  SELECT id INTO _default_profile_id 
  FROM public.access_profiles 
  WHERE name = 'membro' AND is_active = true
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
