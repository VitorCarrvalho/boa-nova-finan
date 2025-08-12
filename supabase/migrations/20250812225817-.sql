-- Corrigir função get_current_user_role para mapear corretamente o perfil "Analista"
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    CASE 
      WHEN p.approval_status = 'ativo' AND ap.name IS NOT NULL THEN 
        CASE ap.name
          WHEN 'Admin' THEN 'admin'::user_role
          WHEN 'Pastor' THEN 'pastor'::user_role
          WHEN 'Gerente Financeiro' THEN 'finance'::user_role
          WHEN 'Analista' THEN 'finance'::user_role
          WHEN 'Gerente' THEN 'gerente'::user_role
          WHEN 'Diretor' THEN 'diretor'::user_role
          WHEN 'Presidente' THEN 'presidente'::user_role
          WHEN 'Assistente' THEN 'assistente'::user_role
          WHEN 'Coordenador' THEN 'coordenador'::user_role
          ELSE 'worker'::user_role
        END
      WHEN p.approval_status = 'ativo' AND p.role IS NOT NULL THEN p.role
      ELSE 'worker'::user_role
    END
  FROM public.profiles p
  LEFT JOIN public.access_profiles ap ON p.profile_id = ap.id AND ap.is_active = true
  WHERE p.id = auth.uid();
$function$;