-- Final attempt with completely unique UUIDs
DO $$
DECLARE
    congregation_id uuid;
    gerente_profile_id uuid;
    diretor_profile_id uuid;
    presidente_profile_id uuid;
    gerente_uuid uuid := 'a0000001-1111-1111-1111-111111111111';
    diretor_uuid uuid := 'b0000002-2222-2222-2222-222222222222';
    presidente_uuid uuid := 'c0000003-3333-3333-3333-333333333333';
BEGIN
    -- Get required IDs
    SELECT id INTO congregation_id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1;
    SELECT id INTO gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    SELECT id INTO diretor_profile_id FROM access_profiles WHERE name = 'Diretor' LIMIT 1;
    SELECT id INTO presidente_profile_id FROM access_profiles WHERE name = 'Presidente' LIMIT 1;
    
    -- Clean up any existing data
    DELETE FROM profiles WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com');
    DELETE FROM auth.users WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com');
    DELETE FROM profiles WHERE id IN (gerente_uuid, diretor_uuid, presidente_uuid);
    DELETE FROM auth.users WHERE id IN (gerente_uuid, diretor_uuid, presidente_uuid);
    
    -- Create auth users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000',
        gerente_uuid,
        'authenticated',
        'authenticated',
        'gerente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Gerente Financeiro Teste"}',
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        diretor_uuid,
        'authenticated',
        'authenticated',
        'diretor@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Diretor Teste"}',
        NOW(),
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        presidente_uuid,
        'authenticated',
        'authenticated',
        'presidente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Presidente Teste"}',
        NOW(),
        NOW()
    );
    
    -- Create profiles
    INSERT INTO profiles (
        id,
        name,
        email,
        role,
        approval_status,
        profile_id,
        congregation_id,
        approved_at,
        created_at,
        updated_at
    ) VALUES 
    (
        gerente_uuid,
        'Gerente Financeiro Teste',
        'gerente@gmail.com',
        'worker',
        'ativo',
        gerente_profile_id,
        congregation_id,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        diretor_uuid,
        'Diretor Teste',
        'diretor@gmail.com',
        'worker',
        'ativo',
        diretor_profile_id,
        congregation_id,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        presidente_uuid,
        'Presidente Teste',
        'presidente@gmail.com',
        'worker',
        'ativo',
        presidente_profile_id,
        congregation_id,
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test users created successfully!';
    
END $$;