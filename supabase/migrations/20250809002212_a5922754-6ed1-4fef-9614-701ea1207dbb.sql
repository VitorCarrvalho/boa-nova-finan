-- ETAPA 3: Migração das RLS Policies para Sistema de Permissões Aninhadas

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

-- 5. Migrar policies críticas para usar sistema de permissões

-- Atualizar policies da tabela profiles
DROP POLICY IF EXISTS "Users can view active profiles for dropdowns" ON public.profiles;
CREATE POLICY "Users can view active profiles for dropdowns" 
ON public.profiles 
FOR SELECT 
USING (
  (approval_status = 'ativo') AND 
  public.user_has_nested_permission('membros.view')
);

DROP POLICY IF EXISTS "Users can view active pastor profiles" ON public.profiles;
CREATE POLICY "Users can view active pastor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (approval_status = 'ativo') AND 
  (role = 'pastor') AND 
  public.user_has_nested_permission('financeiro.view')
);

-- Atualizar policies da tabela members
DROP POLICY IF EXISTS "Users can view members for dropdowns" ON public.members;
CREATE POLICY "Users can view members for dropdowns" 
ON public.members 
FOR SELECT 
USING (
  public.user_has_nested_permission('membros.view') OR 
  public.user_has_nested_permission('financeiro.view')
);

DROP POLICY IF EXISTS "Usuários com permissão podem ver membros" ON public.members;
CREATE POLICY "Usuários com permissão podem ver membros" 
ON public.members 
FOR SELECT 
USING (public.user_has_nested_permission('membros.view'));

DROP POLICY IF EXISTS "Usuários com permissão podem criar membros" ON public.members;
CREATE POLICY "Usuários com permissão podem criar membros" 
ON public.members 
FOR INSERT 
WITH CHECK (public.user_has_nested_permission('membros.insert'));

DROP POLICY IF EXISTS "Usuários com permissão podem editar membros" ON public.members;
CREATE POLICY "Usuários com permissão podem editar membros" 
ON public.members 
FOR UPDATE 
USING (public.user_has_nested_permission('membros.edit'));

-- Atualizar policies da tabela congregations
DROP POLICY IF EXISTS "Usuários com permissão podem ver congregações" ON public.congregations;
CREATE POLICY "Usuários com permissão podem ver congregações" 
ON public.congregations 
FOR SELECT 
USING (public.user_has_nested_permission('congregacoes.view'));

DROP POLICY IF EXISTS "Usuários com permissão podem criar congregações" ON public.congregations;
CREATE POLICY "Usuários com permissão podem criar congregações" 
ON public.congregations 
FOR INSERT 
WITH CHECK (public.user_has_nested_permission('congregacoes.insert'));

DROP POLICY IF EXISTS "Usuários com permissão podem editar congregações" ON public.congregations;
CREATE POLICY "Usuários com permissão podem editar congregações" 
ON public.congregations 
FOR UPDATE 
USING (public.user_has_nested_permission('congregacoes.edit'));

DROP POLICY IF EXISTS "Usuários com permissão podem deletar congregações" ON public.congregations;
CREATE POLICY "Usuários com permissão podem deletar congregações" 
ON public.congregations 
FOR DELETE 
USING (public.user_has_nested_permission('congregacoes.delete'));

-- Atualizar policies da tabela financial_records
DROP POLICY IF EXISTS "Usuários com permissão podem ver registros financeiros" ON public.financial_records;
CREATE POLICY "Usuários com permissão podem ver registros financeiros" 
ON public.financial_records 
FOR SELECT 
USING (
  public.user_has_nested_permission('financeiro.view') AND
  (NOT public.module_requires_congregation_access('financeiro') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários com permissão podem criar registros financeiros" ON public.financial_records;
CREATE POLICY "Usuários com permissão podem criar registros financeiros" 
ON public.financial_records 
FOR INSERT 
WITH CHECK (
  public.user_has_nested_permission('financeiro.insert') AND
  (created_by = auth.uid()) AND
  (NOT public.module_requires_congregation_access('financeiro') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários com permissão podem editar registros financeiros" ON public.financial_records;
CREATE POLICY "Usuários com permissão podem editar registros financeiros" 
ON public.financial_records 
FOR UPDATE 
USING (
  public.user_has_nested_permission('financeiro.edit') AND
  (NOT public.module_requires_congregation_access('financeiro') OR public.user_has_congregation_access())
);

-- Atualizar policies da tabela reconciliations
DROP POLICY IF EXISTS "Usuários podem ver conciliações baseado em permissões" ON public.reconciliations;
CREATE POLICY "Usuários podem ver conciliações baseado em permissões" 
ON public.reconciliations 
FOR SELECT 
USING (
  public.user_has_nested_permission('conciliacoes.view') AND
  (public.user_has_nested_permission('conciliacoes.approve') OR (sent_by = auth.uid())) AND
  (NOT public.module_requires_congregation_access('conciliacoes') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários com permissão podem criar conciliações" ON public.reconciliations;
CREATE POLICY "Usuários com permissão podem criar conciliações" 
ON public.reconciliations 
FOR INSERT 
WITH CHECK (
  public.user_has_nested_permission('conciliacoes.insert') AND 
  (sent_by = auth.uid()) AND
  (NOT public.module_requires_congregation_access('conciliacoes') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários podem editar suas próprias conciliações pendentes" ON public.reconciliations;
CREATE POLICY "Usuários podem editar suas próprias conciliações pendentes" 
ON public.reconciliations 
FOR UPDATE 
USING (
  public.user_has_nested_permission('conciliacoes.insert') AND 
  (sent_by = auth.uid()) AND 
  (status = 'pending') AND
  (NOT public.module_requires_congregation_access('conciliacoes') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários com permissão podem aprovar/rejeitar conciliações" ON public.reconciliations;
CREATE POLICY "Usuários com permissão podem aprovar/rejeitar conciliações" 
ON public.reconciliations 
FOR UPDATE 
USING (
  public.user_has_nested_permission('conciliacoes.approve') AND
  (NOT public.module_requires_congregation_access('conciliacoes') OR public.user_has_congregation_access())
);

DROP POLICY IF EXISTS "Usuários com permissão podem deletar conciliações" ON public.reconciliations;
CREATE POLICY "Usuários com permissão podem deletar conciliações" 
ON public.reconciliations 
FOR DELETE 
USING (
  public.user_has_nested_permission('conciliacoes.delete') AND
  (NOT public.module_requires_congregation_access('conciliacoes') OR public.user_has_congregation_access())
);

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