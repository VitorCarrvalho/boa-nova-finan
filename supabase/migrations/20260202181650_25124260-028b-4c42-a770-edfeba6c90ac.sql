-- Criar usuário super admin
DO $$
DECLARE
  _user_id uuid := gen_random_uuid();
  _tenant_id uuid;
  _profile_id uuid;
BEGIN
  -- Verificar se usuário já existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@gmail.com') THEN
    SELECT id INTO _user_id FROM auth.users WHERE email = 'superadmin@gmail.com';
  ELSE
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      _user_id,
      '00000000-0000-0000-0000-000000000000',
      'superadmin@gmail.com',
      crypt('12345678', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Super Admin"}'::jsonb,
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Obter tenant padrão
  SELECT id INTO _tenant_id FROM public.tenants WHERE slug = 'iptm-global' LIMIT 1;
  
  -- Obter perfil Admin
  SELECT id INTO _profile_id FROM public.access_profiles WHERE name = 'Admin' AND is_active = true LIMIT 1;

  -- Criar/atualizar perfil
  INSERT INTO public.profiles (id, name, email, approval_status, role, tenant_id, profile_id)
  VALUES (_user_id, 'Super Admin', 'superadmin@gmail.com', 'ativo', 'superadmin'::user_role, _tenant_id, _profile_id)
  ON CONFLICT (id) DO UPDATE SET
    approval_status = 'ativo',
    role = 'superadmin'::user_role,
    profile_id = _profile_id,
    tenant_id = _tenant_id;

  -- Adicionar à tabela super_admins
  INSERT INTO public.super_admins (user_id, created_by)
  VALUES (_user_id, _user_id)
  ON CONFLICT DO NOTHING;
END $$;