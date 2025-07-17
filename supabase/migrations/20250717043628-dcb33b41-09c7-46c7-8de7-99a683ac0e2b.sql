-- Corrigir bug no cadastro de novos usuários
-- O problema é que o enum user_role pode ter sido corrompido durante a limpeza

-- 1. Primeiro, verificar e recriar o enum user_role se necessário
DO $$
BEGIN
    -- Se o tipo não existir, criar
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM (
            'superadmin',
            'admin', 
            'finance',
            'pastor',
            'worker',
            'assistente',
            'analista',
            'coordenador',
            'gerente',
            'diretor',
            'presidente'
        );
    END IF;
END $$;

-- 2. Recriar a função handle_new_user com tratamento de erro mais robusto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _default_profile_id UUID;
BEGIN
  -- Log para debug
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  
  -- Get default profile ID (Membro)
  SELECT id INTO _default_profile_id 
  FROM public.access_profiles 
  WHERE name = 'Membro' AND is_active = true
  LIMIT 1;

  -- Log para debug
  RAISE LOG 'Default profile found: %', _default_profile_id;

  -- Insert new profile with explicit role casting
  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status, profile_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'em_analise',
    _default_profile_id,
    'worker'::public.user_role  -- Explicit schema qualification
  );
  
  -- Log para debug
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro detalhado
    RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLERRM, SQLSTATE;
    -- Re-raise o erro para não bloquear silenciosamente
    RAISE;
END;
$$;

-- 3. Verificar se o trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se o perfil padrão "Membro" existe
INSERT INTO public.access_profiles (name, description, permissions, is_active)
VALUES (
  'Membro',
  'Perfil padrão para membros da congregação',
  '{}',
  true
) ON CONFLICT (name) DO NOTHING;

-- 5. Log final
DO $$
BEGIN
  RAISE LOG 'User registration system restored successfully';
END $$;