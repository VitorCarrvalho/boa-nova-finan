-- ETAPA 3: Migração das RLS Policies para Sistema de Permissões Aninhadas (Corrigida)

-- 1. Criar função para verificar permissões aninhadas
CREATE OR REPLACE FUNCTION public.user_has_nested_permission(_permission_path text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _permissions jsonb;
  _keys text[];
  _current jsonb;
  _key text;
BEGIN
  -- Obter ID do usuário atual
  _user_id := auth.uid();
  
  -- Se não há usuário autenticado, retornar false
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar permissões do usuário ativo
  SELECT 
    COALESCE(ap.permissions, '{}'::jsonb)
  INTO _permissions
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id AND ap.is_active = true
  WHERE p.id = _user_id 
    AND p.approval_status = 'ativo';
    
  -- Se não encontrou permissões, retornar false
  IF _permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Navegar pela estrutura aninhada
  _keys := string_to_array(_permission_path, '.');
  _current := _permissions;
  
  FOREACH _key IN ARRAY _keys
  LOOP
    IF _current ? _key THEN
      _current := _current -> _key;
    ELSE
      RETURN false;
    END IF;
  END LOOP;
  
  -- Verificar se o valor final é true
  RETURN (_current::text)::boolean;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 2. Atualizar função user_has_permission para suportar permissões aninhadas
CREATE OR REPLACE FUNCTION public.user_has_permission(_module text, _action text DEFAULT 'view'::text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.user_has_nested_permission(_module || '.' || _action);
$$;

-- 3. Criar função para verificar se módulo requer acesso à congregação
CREATE OR REPLACE FUNCTION public.module_requires_congregation_access(_module text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT _module IN ('financeiro', 'conciliacoes');
$$;

-- 4. Criar função para verificar se usuário tem acesso a congregações
CREATE OR REPLACE FUNCTION public.user_has_congregation_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _user_role user_role;
  _has_congregation_assignment boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar role do usuário
  SELECT role INTO _user_role
  FROM public.profiles 
  WHERE id = _user_id AND approval_status = 'ativo';
  
  -- Admin e superadmin sempre têm acesso
  IF _user_role IN ('admin', 'superadmin') THEN
    RETURN true;
  END IF;
  
  -- Pastor: verificar se tem congregação atribuída
  IF _user_role = 'pastor' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND congregation_id IS NOT NULL
    ) INTO _has_congregation_assignment;
    
    RETURN _has_congregation_assignment;
  END IF;
  
  -- Finance e worker não têm acesso
  RETURN false;
END;
$$;

-- 5. Adicionar constraint único na coluna name da tabela access_profiles
ALTER TABLE public.access_profiles ADD CONSTRAINT access_profiles_name_unique UNIQUE (name);

-- 6. Criar perfil Super Admin com todas as permissões
INSERT INTO public.access_profiles (name, description, permissions, is_active)
VALUES (
  'Super Admin',
  'Perfil com acesso completo a todos os módulos e funcionalidades do sistema',
  '{
    "dashboard": {
      "view": true,
      "export": true
    },
    "membros": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "congregacoes": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "departamentos": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "ministerios": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "eventos": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "financeiro": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true,
      "despesas": {
        "view": true,
        "insert": true,
        "edit": true,
        "delete": true,
        "export": true
      },
      "receitas": {
        "view": true,
        "insert": true,
        "edit": true,
        "delete": true,
        "export": true
      }
    },
    "conciliacoes": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "approve": true,
      "export": true
    },
    "fornecedores": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "contas-pagar": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "approve": true,
      "export": true,
      "paid_accounts": {
        "view": true,
        "export": true
      },
      "new_account": {
        "view": true,
        "insert": true
      },
      "pending_approval": {
        "view": true,
        "approve": true
      },
      "authorize_accounts": {
        "view": true,
        "approve": true
      },
      "approved_accounts": {
        "view": true,
        "export": true
      }
    },
    "relatorios": {
      "view": true,
      "export": true,
      "eventos": {
        "view": true,
        "export": true
      },
      "financeiro": {
        "view": true,
        "export": true
      },
      "membros": {
        "view": true,
        "export": true
      },
      "conciliacoes": {
        "view": true,
        "export": true
      },
      "fornecedores": {
        "view": true,
        "export": true
      }
    },
    "notificacoes": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "send": true
    },
    "gestao-acessos": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "approve": true
    },
    "documentacao": {
      "view": true,
      "insert": true,
      "edit": true,
      "delete": true,
      "export": true
    },
    "configuracoes": {
      "view": true,
      "edit": true
    }
  }'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  description = EXCLUDED.description,
  updated_at = now();