
-- =====================================================
-- ETAPA 2: Migrar RLS de role para access_profiles
-- =====================================================

-- 1. Criar função helper: is_current_user_org_admin()
-- Verifica se o usuário logado tem perfil "Admin" ativo
CREATE OR REPLACE FUNCTION public.is_current_user_org_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.access_profiles ap ON p.profile_id = ap.id
    WHERE p.id = auth.uid()
      AND p.approval_status = 'ativo'
      AND ap.is_active = true
      AND ap.name = 'Admin'
  );
$$;

-- 2. Criar função helper: get_current_user_profile_name()
-- Retorna o nome do access_profile do usuário logado
CREATE OR REPLACE FUNCTION public.get_current_user_profile_name()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT ap.name
  FROM public.profiles p
  JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = auth.uid()
    AND p.approval_status = 'ativo'
    AND ap.is_active = true
  LIMIT 1;
$$;

-- =====================================================
-- 3. Atualizar policies da tabela access_profiles
-- =====================================================
DROP POLICY IF EXISTS "Superadmins can manage access profiles" ON public.access_profiles;
CREATE POLICY "Superadmins can manage access profiles"
ON public.access_profiles FOR ALL TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Tenant admins can manage their access profiles" ON public.access_profiles;
CREATE POLICY "Tenant admins can manage their access profiles"
ON public.access_profiles FOR ALL TO authenticated
USING (is_current_user_org_admin() AND tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (is_current_user_org_admin() AND tenant_id = get_user_tenant_id(auth.uid()));

-- =====================================================
-- 4. Atualizar policies da tabela approval_audit_logs
-- =====================================================
DROP POLICY IF EXISTS "Admins can view approval audit logs" ON public.approval_audit_logs;
CREATE POLICY "Admins can view approval audit logs"
ON public.approval_audit_logs FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 5. Atualizar policies da tabela audit_logs
-- =====================================================
DROP POLICY IF EXISTS "Admins podem ver logs de auditoria" ON public.audit_logs;
CREATE POLICY "Admins podem ver logs de auditoria"
ON public.audit_logs FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 6. Atualizar policies da tabela documentation_sections
-- =====================================================
DROP POLICY IF EXISTS "Admins can create documentation" ON public.documentation_sections;
CREATE POLICY "Admins can create documentation"
ON public.documentation_sections FOR INSERT TO authenticated
WITH CHECK (is_super_admin() OR is_current_user_org_admin());

DROP POLICY IF EXISTS "Admins can delete documentation" ON public.documentation_sections;
CREATE POLICY "Admins can delete documentation"
ON public.documentation_sections FOR DELETE TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

DROP POLICY IF EXISTS "Admins can update documentation" ON public.documentation_sections;
CREATE POLICY "Admins can update documentation"
ON public.documentation_sections FOR UPDATE TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 7. Atualizar policies da tabela expense_categories
-- =====================================================
DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON public.expense_categories;
CREATE POLICY "Admins podem gerenciar categorias"
ON public.expense_categories FOR ALL TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 8. Atualizar policies da tabela notifications
-- =====================================================
DROP POLICY IF EXISTS "Admins podem gerenciar notificações" ON public.notifications;
CREATE POLICY "Admins podem gerenciar notificações"
ON public.notifications FOR ALL TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 9. Atualizar policies da tabela pedidos_oracao
-- =====================================================
DROP POLICY IF EXISTS "Only admins can view prayer requests" ON public.pedidos_oracao;
CREATE POLICY "Only admins can view prayer requests"
ON public.pedidos_oracao FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 10. Atualizar policies da tabela profiles
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

DROP POLICY IF EXISTS "Approved users can update their own profile" ON public.profiles;
CREATE POLICY "Approved users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (
  (auth.uid() = id AND approval_status = 'ativo')
  OR is_super_admin()
  OR is_current_user_org_admin()
);

DROP POLICY IF EXISTS "Users can view active pastor profiles" ON public.profiles;
CREATE POLICY "Users can view active pastor profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  approval_status = 'ativo'
  AND EXISTS (
    SELECT 1 FROM public.access_profiles ap
    WHERE ap.id = profiles.profile_id
      AND ap.name = 'Pastor'
      AND ap.is_active = true
  )
  AND user_has_permission('financeiro', 'view')
);

-- =====================================================
-- 11. Atualizar policies da tabela service_categories
-- =====================================================
DROP POLICY IF EXISTS "Admins can manage categories" ON public.service_categories;
CREATE POLICY "Admins can manage categories"
ON public.service_categories FOR ALL TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 12. Atualizar policies da tabela service_contact_clicks
-- =====================================================
DROP POLICY IF EXISTS "Admins can view contact metrics" ON public.service_contact_clicks;
CREATE POLICY "Admins can view contact metrics"
ON public.service_contact_clicks FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 13. Atualizar policies da tabela event_registrations
-- =====================================================
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.event_registrations;
CREATE POLICY "Users can update their own registrations"
ON public.event_registrations FOR UPDATE TO authenticated
USING (
  is_super_admin()
  OR is_current_user_org_admin()
  OR (get_current_user_profile_name() = 'Pastor')
  OR (EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = event_registrations.member_id
      AND members.email = (SELECT p.email FROM public.profiles p WHERE p.id = auth.uid())
  ))
);

-- =====================================================
-- 14. Atualizar policies da tabela pre_inscricoes
-- =====================================================
DROP POLICY IF EXISTS "Only admins can view pre-registrations" ON public.pre_inscricoes;
CREATE POLICY "Only admins can view pre-registrations"
ON public.pre_inscricoes FOR SELECT TO authenticated
USING (is_super_admin() OR is_current_user_org_admin());

-- =====================================================
-- 15. Atualizar policies de DELETE em members e financial_records
--     (já criadas na etapa 1, atualizar para usar nova função)
-- =====================================================
DROP POLICY IF EXISTS "Admins podem deletar membros do tenant" ON public.members;
CREATE POLICY "Admins podem deletar membros do tenant"
ON public.members FOR DELETE TO authenticated
USING (
  is_super_admin()
  OR (is_current_user_org_admin() AND tenant_id = get_user_tenant_id(auth.uid()))
);

DROP POLICY IF EXISTS "Admins podem deletar registros financeiros do tenant" ON public.financial_records;
CREATE POLICY "Admins podem deletar registros financeiros do tenant"
ON public.financial_records FOR DELETE TO authenticated
USING (
  is_super_admin()
  OR (is_current_user_org_admin() AND tenant_id = get_user_tenant_id(auth.uid()))
);

-- =====================================================
-- 16. Atualizar funções approve_user e reject_user
--     para usar is_current_user_org_admin() em vez de get_current_user_role()
-- =====================================================

-- approve_user
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id uuid,
  _profile_id uuid,
  _congregation_id uuid DEFAULT NULL,
  _ministries text[] DEFAULT NULL,
  _approved_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _previous_status TEXT;
  _previous_profile_id UUID;
  _profile_name TEXT;
  _mapped_role user_role;
  _user_email TEXT;
  _user_name TEXT;
  _congregation_name TEXT;
  _email_payload jsonb;
BEGIN
  -- SECURITY CHECK: Only admins and superadmins can approve users
  IF NOT (is_super_admin() OR is_current_user_org_admin()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can approve users.';
  END IF;
  
  -- Get current status and profile_id
  SELECT approval_status, profile_id, email, name INTO _previous_status, _previous_profile_id, _user_email, _user_name
  FROM public.profiles WHERE id = _user_id;
  
  -- Get profile name for audit log
  SELECT name INTO _profile_name FROM public.access_profiles WHERE id = _profile_id;
  
  -- Get congregation name if provided
  IF _congregation_id IS NOT NULL THEN
    SELECT name INTO _congregation_name FROM public.congregations WHERE id = _congregation_id;
  END IF;
  
  -- Map profile name to user_role enum for backward compat
  _mapped_role := CASE _profile_name
    WHEN 'Admin' THEN 'admin'::user_role
    WHEN 'Pastor' THEN 'pastor'::user_role
    WHEN 'Gerente Financeiro' THEN 'finance'::user_role
    ELSE 'worker'::user_role
  END;
  
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
  
  -- Log the approval
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, congregation_id, ministries
  ) VALUES (
    _user_id, COALESCE(_approved_by, auth.uid()), _previous_status, 'ativo',
    NULL, _mapped_role, _congregation_id, _ministries
  );
  
  -- Send approval email
  IF _user_email IS NOT NULL THEN
    BEGIN
      _email_payload := jsonb_build_object(
        'userEmail', _user_email,
        'userName', _user_name,
        'profileName', _profile_name,
        'congregationName', _congregation_name,
        'loginUrl', 'https://jryifbcsifodvocshnvuo.supabase.co/'
      );
      
      PERFORM net.http_post(
        url := 'https://jryifbcsifodvocshnvuo.supabase.co/functions/v1/send-approval-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeWlmYmNzaWZvZHZvY3NodnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzAwOTYsImV4cCI6MjA2NTc0NjA5Nn0.19evtStOEzVAbXX-Z27xi35JnTC7vd046EDRFrb9ETE'
        ),
        body := _email_payload
      );
      
      RAISE NOTICE 'Approval email queued for %', _user_email;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to send approval email to %: %', _user_email, SQLERRM;
    END;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- reject_user (versão com 3 params)
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id uuid,
  _rejection_reason text DEFAULT NULL,
  _rejected_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _previous_status TEXT;
  _previous_role user_role;
BEGIN
  IF NOT (is_super_admin() OR is_current_user_org_admin()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can reject users.';
  END IF;
  
  SELECT approval_status, role INTO _previous_status, _previous_role
  FROM public.profiles WHERE id = _user_id;
  
  UPDATE public.profiles 
  SET 
    approval_status = 'rejeitado',
    rejection_reason = _rejection_reason,
    approved_by = COALESCE(_rejected_by, auth.uid()),
    approved_at = now()
  WHERE id = _user_id;
  
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, rejection_reason
  ) VALUES (
    _user_id, COALESCE(_rejected_by, auth.uid()), _previous_status, 'rejeitado',
    _previous_role, _previous_role, _rejection_reason
  );
  
  RETURN TRUE;
END;
$function$;

-- reject_user (versão com 4 params - allow_reapply)
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id uuid,
  _rejection_reason text DEFAULT NULL,
  _rejected_by uuid DEFAULT NULL,
  _allow_reapply boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _previous_status TEXT;
  _previous_role user_role;
BEGIN
  IF NOT (is_super_admin() OR is_current_user_org_admin()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can reject users.';
  END IF;
  
  SELECT approval_status, role INTO _previous_status, _previous_role
  FROM public.profiles WHERE id = _user_id;
  
  INSERT INTO public.approval_audit_logs (
    user_id, changed_by, previous_status, new_status, 
    previous_role, new_role, rejection_reason
  ) VALUES (
    _user_id, COALESCE(_rejected_by, auth.uid()), _previous_status, 'rejeitado',
    _previous_role, _previous_role, _rejection_reason
  );
  
  IF _allow_reapply THEN
    DELETE FROM auth.users WHERE id = _user_id;
  ELSE
    UPDATE public.profiles 
    SET 
      approval_status = 'rejeitado',
      rejection_reason = _rejection_reason,
      approved_by = COALESCE(_rejected_by, auth.uid()),
      approved_at = now()
    WHERE id = _user_id;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- =====================================================
-- 17. Atualizar assign_unique_profile para usar nova função
-- =====================================================
CREATE OR REPLACE FUNCTION public.assign_unique_profile(
  _user_id uuid,
  _profile_id uuid,
  _assigned_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT (is_super_admin() OR is_current_user_org_admin()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can assign user profiles.';
  END IF;
  
  UPDATE public.user_profile_assignments 
  SET is_active = false 
  WHERE user_id = _user_id AND is_active = true;
  
  UPDATE public.profiles 
  SET profile_id = _profile_id 
  WHERE id = _user_id;
  
  INSERT INTO public.user_profile_assignments (user_id, profile_id, assigned_by)
  VALUES (_user_id, _profile_id, COALESCE(_assigned_by, auth.uid()))
  ON CONFLICT (user_id, profile_id) DO UPDATE SET 
    is_active = true,
    assigned_at = now(),
    assigned_by = COALESCE(_assigned_by, auth.uid());
    
  RETURN TRUE;
END;
$function$;

-- =====================================================
-- 18. Atualizar user_has_congregation_access para usar access_profiles
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_has_congregation_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _user_id uuid;
  _profile_name text;
  _has_congregation_assignment boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin sempre tem acesso
  IF is_super_admin(_user_id) THEN
    RETURN true;
  END IF;
  
  -- Buscar nome do perfil
  SELECT ap.name INTO _profile_name
  FROM public.profiles p
  JOIN public.access_profiles ap ON p.profile_id = ap.id
  WHERE p.id = _user_id AND p.approval_status = 'ativo' AND ap.is_active = true;
  
  -- Admin sempre tem acesso
  IF _profile_name = 'Admin' THEN
    RETURN true;
  END IF;
  
  -- Pastor: verificar se tem congregação atribuída
  IF _profile_name = 'Pastor' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND congregation_id IS NOT NULL
    ) INTO _has_congregation_assignment;
    RETURN _has_congregation_assignment;
  END IF;
  
  RETURN false;
END;
$function$;
