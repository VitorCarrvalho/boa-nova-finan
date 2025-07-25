-- Corrigir profile_id do usuário contato@leonardosale.com para Gerente Financeiro
DO $$
DECLARE
    _gerente_profile_id uuid;
    _contato_user_id uuid;
BEGIN
    -- Get Gerente Financeiro profile ID
    SELECT id INTO _gerente_profile_id FROM access_profiles WHERE name = 'Gerente Financeiro' LIMIT 1;
    
    -- Get contato user ID by email
    SELECT id INTO _contato_user_id FROM profiles WHERE email = 'contato@leonardosale.com' LIMIT 1;
    
    -- Update the user's profile_id to Gerente Financeiro
    UPDATE profiles 
    SET 
        profile_id = _gerente_profile_id,
        updated_at = now()
    WHERE email = 'contato@leonardosale.com';
    
    RAISE NOTICE 'Updated user contato@leonardosale.com to have Gerente Financeiro profile. User ID: %, Profile ID: %', _contato_user_id, _gerente_profile_id;
    
END $$;