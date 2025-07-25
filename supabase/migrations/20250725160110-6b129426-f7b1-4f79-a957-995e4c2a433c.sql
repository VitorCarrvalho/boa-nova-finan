-- Update existing profiles to have the correct access profiles
DO $$
DECLARE
    congregation_id uuid;
    gerente_profile_id uuid;
    diretor_profile_id uuid;
    presidente_profile_id uuid;
BEGIN
    -- Get necessary IDs
    SELECT id INTO congregation_id FROM congregations WHERE name = 'IPTM - Mesquisa' LIMIT 1;
    SELECT id INTO gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    SELECT id INTO diretor_profile_id FROM access_profiles WHERE name = 'Diretor' LIMIT 1;
    SELECT id INTO presidente_profile_id FROM access_profiles WHERE name = 'Presidente' LIMIT 1;
    
    -- Update existing profiles that were created by the trigger
    UPDATE profiles 
    SET 
        name = 'Gerente Financeiro Teste',
        email = 'gerente@gmail.com',
        approval_status = 'ativo',
        profile_id = gerente_profile_id,
        congregation_id = congregation_id,
        approved_at = now()
    WHERE id = 'a0000001-1111-1111-1111-111111111111';
    
    UPDATE profiles 
    SET 
        name = 'Diretor Teste',
        email = 'diretor@gmail.com', 
        approval_status = 'ativo',
        profile_id = diretor_profile_id,
        congregation_id = congregation_id,
        approved_at = now()
    WHERE id = 'b0000002-2222-2222-2222-222222222222';
    
    UPDATE profiles 
    SET 
        name = 'Presidente Teste',
        email = 'presidente@gmail.com',
        approval_status = 'ativo', 
        profile_id = presidente_profile_id,
        congregation_id = congregation_id,
        approved_at = now()
    WHERE id = 'c0000003-3333-3333-3333-333333333333';
    
    RAISE NOTICE 'Test user profiles updated successfully!';
    
END $$;