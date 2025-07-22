
-- Remover enum recipient_profile existente e recriar com valores corretos
DROP TYPE IF EXISTS public.recipient_profile CASCADE;

-- Criar novo enum recipient_profile alinhado com member_role
CREATE TYPE public.recipient_profile AS ENUM (
    'member',    -- Membros
    'worker',    -- Obreiros  
    'pastor',    -- Pastores
    'todos'      -- Todos
);

-- Recriar a coluna recipient_profiles na tabela notifications
ALTER TABLE public.notifications 
ALTER COLUMN recipient_profiles TYPE text[] USING recipient_profiles::text[];

ALTER TABLE public.notifications 
ALTER COLUMN recipient_profiles TYPE public.recipient_profile[] 
USING array(SELECT unnest(recipient_profiles)::public.recipient_profile);

-- Atualizar dados existentes se houver (mapear valores antigos para novos)
UPDATE public.notifications 
SET recipient_profiles = CASE 
    WHEN 'pastores' = ANY(recipient_profiles::text[]) THEN array_append(
        array_remove(recipient_profiles::text[], 'pastores')::public.recipient_profile[], 
        'pastor'::public.recipient_profile
    )
    ELSE recipient_profiles
END;

UPDATE public.notifications 
SET recipient_profiles = CASE 
    WHEN 'membros' = ANY(recipient_profiles::text[]) THEN array_append(
        array_remove(recipient_profiles::text[], 'membros')::public.recipient_profile[], 
        'member'::public.recipient_profile
    )
    ELSE recipient_profiles  
END;

UPDATE public.notifications 
SET recipient_profiles = CASE 
    WHEN 'financeiro' = ANY(recipient_profiles::text[]) THEN array_append(
        array_remove(recipient_profiles::text[], 'financeiro')::public.recipient_profile[], 
        'worker'::public.recipient_profile
    )
    ELSE recipient_profiles
END;
