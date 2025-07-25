-- Simple approach: Create users one by one using auth functions

-- Create gerente user
DO $$
DECLARE
    gerente_user_id uuid;
    diretor_user_id uuid;
    presidente_user_id uuid;
    congregation_id uuid;
    gerente_profile_id uuid;
    diretor_profile_id uuid;
    presidente_profile_id uuid;
BEGIN
    -- Get congregation ID
    SELECT id INTO congregation_id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1;
    
    -- Get profile IDs
    SELECT id INTO gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    SELECT id INTO diretor_profile_id FROM access_profiles WHERE name = 'Diretor' LIMIT 1;
    SELECT id INTO presidente_profile_id FROM access_profiles WHERE name = 'Presidente' LIMIT 1;
    
    -- Create gerente user ID
    gerente_user_id := gen_random_uuid();
    
    -- Insert into auth.users for gerente
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
    
    -- Insert profile for gerente
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
    diretor_user_id := gen_random_uuid();
    
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
    presidente_user_id := gen_random_uuid();
    
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
    
END $$;