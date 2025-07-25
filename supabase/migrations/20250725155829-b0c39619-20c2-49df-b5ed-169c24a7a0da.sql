-- Create test users with safe approach
DO $$
DECLARE
    gerente_user_id uuid := gen_random_uuid();
    diretor_user_id uuid := gen_random_uuid();
    presidente_user_id uuid := gen_random_uuid();
    congregation_id uuid;
    gerente_profile_id uuid;
    diretor_profile_id uuid;
    presidente_profile_id uuid;
BEGIN
    -- Ensure unique IDs by checking they don't exist
    WHILE EXISTS (SELECT 1 FROM auth.users WHERE id = gerente_user_id) LOOP
        gerente_user_id := gen_random_uuid();
    END LOOP;
    
    WHILE EXISTS (SELECT 1 FROM auth.users WHERE id = diretor_user_id) LOOP
        diretor_user_id := gen_random_uuid();
    END LOOP;
    
    WHILE EXISTS (SELECT 1 FROM auth.users WHERE id = presidente_user_id) LOOP
        presidente_user_id := gen_random_uuid();
    END LOOP;
    
    -- Get necessary IDs
    SELECT id INTO congregation_id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1;
    SELECT id INTO gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    SELECT id INTO diretor_profile_id FROM access_profiles WHERE name = 'Diretor' LIMIT 1;
    SELECT id INTO presidente_profile_id FROM access_profiles WHERE name = 'Presidente' LIMIT 1;
    
    -- Delete existing users if they exist
    DELETE FROM auth.users WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com');
    
    -- Create gerente user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        gerente_user_id,
        '00000000-0000-0000-0000-000000000000',
        'gerente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated'
    );
    
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
    ) VALUES (
        gerente_user_id,
        'Gerente Financeiro Teste',
        'gerente@gmail.com',
        'worker',
        'ativo',
        gerente_profile_id,
        congregation_id,
        now(),
        now(),
        now()
    );
    
    -- Create diretor user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        diretor_user_id,
        '00000000-0000-0000-0000-000000000000',
        'diretor@gmail.com',
        crypt('12345678', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated'
    );
    
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
    ) VALUES (
        diretor_user_id,
        'Diretor Teste',
        'diretor@gmail.com',
        'worker',
        'ativo',
        diretor_profile_id,
        congregation_id,
        now(),
        now(),
        now()
    );
    
    -- Create presidente user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        presidente_user_id,
        '00000000-0000-0000-0000-000000000000',
        'presidente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated'
    );
    
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
    ) VALUES (
        presidente_user_id,
        'Presidente Teste',
        'presidente@gmail.com',
        'worker',
        'ativo',
        presidente_profile_id,
        congregation_id,
        now(),
        now(),
        now()
    );
    
    RAISE NOTICE 'Successfully created test users: gerente@gmail.com, diretor@gmail.com, presidente@gmail.com';
    
END $$;