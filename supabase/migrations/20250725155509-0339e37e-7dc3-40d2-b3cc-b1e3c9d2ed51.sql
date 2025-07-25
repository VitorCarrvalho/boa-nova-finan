-- Create test users for accounts payable approval flow
-- Insert users into auth.users with encrypted passwords

-- Create gerente@gmail.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'gerente@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"name": "Gerente Financeiro Teste"}'::jsonb
);

-- Create diretor@gmail.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'diretor@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"name": "Diretor Teste"}'::jsonb
);

-- Create presidente@gmail.com
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'presidente@gmail.com',
  crypt('12345678', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"name": "Presidente Teste"}'::jsonb
);

-- Create profiles for the test users
-- Get the user IDs for the profiles
WITH user_ids AS (
  SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name
  FROM auth.users 
  WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com')
),
profile_mappings AS (
  SELECT 
    ui.id as user_id,
    ui.email,
    ui.name,
    CASE ui.email
      WHEN 'gerente@gmail.com' THEN (SELECT id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1)
      WHEN 'diretor@gmail.com' THEN (SELECT id FROM access_profiles WHERE name = 'Diretor' LIMIT 1)
      WHEN 'presidente@gmail.com' THEN (SELECT id FROM access_profiles WHERE name = 'Presidente' LIMIT 1)
    END as profile_id
  FROM user_ids ui
)
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  approval_status,
  profile_id,
  congregation_id,
  approved_by,
  approved_at,
  created_at,
  updated_at
)
SELECT 
  pm.user_id,
  pm.name,
  pm.email,
  'worker'::user_role,
  'ativo',
  pm.profile_id,
  (SELECT id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1),
  (SELECT id FROM profiles WHERE email = 'admin@teste.com' LIMIT 1), -- Assuming admin user exists
  now(),
  now(),
  now()
FROM profile_mappings pm;