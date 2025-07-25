-- Use Supabase Admin approach to create users safely
-- This will work around ID conflicts by using a simpler method

-- First, ensure we have the necessary profile IDs
DO $$
DECLARE
    congregation_id uuid;
    gerente_profile_id uuid;
    diretor_profile_id uuid;
    presidente_profile_id uuid;
BEGIN
    -- Get IDs we need
    SELECT id INTO congregation_id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1;
    SELECT id INTO gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    SELECT id INTO diretor_profile_id FROM access_profiles WHERE name = 'Diretor' LIMIT 1;
    SELECT id INTO presidente_profile_id FROM access_profiles WHERE name = 'Presidente' LIMIT 1;
    
    -- Check if we found all required profiles
    IF gerente_profile_id IS NULL OR diretor_profile_id IS NULL OR presidente_profile_id IS NULL THEN
        RAISE EXCEPTION 'Required access profiles not found';
    END IF;
    
    -- Remove any existing test users first
    DELETE FROM profiles WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com');
    DELETE FROM auth.users WHERE email IN ('gerente@gmail.com', 'diretor@gmail.com', 'presidente@gmail.com');
    
    -- Insert auth users with direct method
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000',
        'a1111111-1111-1111-1111-111111111111',
        'authenticated',
        'authenticated',
        'gerente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Gerente Financeiro Teste"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'b2222222-2222-2222-2222-222222222222',
        'authenticated',
        'authenticated',
        'diretor@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Diretor Teste"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'c3333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'presidente@gmail.com',
        crypt('12345678', gen_salt('bf')),
        NOW(),
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Presidente Teste"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Insert corresponding profiles
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
        'a1111111-1111-1111-1111-111111111111',
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
        'b2222222-2222-2222-2222-222222222222',
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
        'c3333333-3333-3333-3333-333333333333',
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
    
    RAISE NOTICE 'Successfully created test users with fixed IDs';
    
END $$;