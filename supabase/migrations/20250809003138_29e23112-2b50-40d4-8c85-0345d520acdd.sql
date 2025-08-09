-- ETAPA 5: Sistema de Atribuição de Perfis aos Usuários

-- 1. Criar tabela user_profile_assignments se não existir
CREATE TABLE IF NOT EXISTS public.user_profile_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.access_profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, profile_id)
);

-- 2. Enable RLS
ALTER TABLE public.user_profile_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Admins can manage user profile assignments"
ON public.user_profile_assignments
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profile_assignments_user_id ON public.user_profile_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_assignments_profile_id ON public.user_profile_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_assignments_active ON public.user_profile_assignments(is_active) WHERE is_active = true;

-- 5. Create function to automatically assign default profile to new users
CREATE OR REPLACE FUNCTION public.assign_default_profile_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _default_profile_id UUID;
BEGIN
  -- Only assign default profile if user doesn't have profile_id set
  IF NEW.profile_id IS NULL THEN
    -- Get default profile (Membro)
    SELECT id INTO _default_profile_id 
    FROM public.access_profiles 
    WHERE name = 'Membro' AND is_active = true
    LIMIT 1;
    
    IF _default_profile_id IS NOT NULL THEN
      -- Update the profile_id in profiles table
      NEW.profile_id := _default_profile_id;
      
      -- Create assignment record
      INSERT INTO public.user_profile_assignments (user_id, profile_id, assigned_by)
      VALUES (NEW.id, _default_profile_id, NEW.id)
      ON CONFLICT (user_id, profile_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for automatic assignment (but only on INSERT)
DROP TRIGGER IF EXISTS trigger_assign_default_profile ON public.profiles;
CREATE TRIGGER trigger_assign_default_profile
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_profile_to_user();

-- 7. Create function to sync profile assignments when profile_id changes
CREATE OR REPLACE FUNCTION public.sync_profile_assignments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If profile_id changed and it's not null
  IF OLD.profile_id IS DISTINCT FROM NEW.profile_id AND NEW.profile_id IS NOT NULL THEN
    -- Deactivate old assignments
    UPDATE public.user_profile_assignments 
    SET is_active = false 
    WHERE user_id = NEW.id AND is_active = true;
    
    -- Create new assignment
    INSERT INTO public.user_profile_assignments (user_id, profile_id, assigned_by)
    VALUES (NEW.id, NEW.profile_id, COALESCE(auth.uid(), NEW.id))
    ON CONFLICT (user_id, profile_id) DO UPDATE SET 
      is_active = true,
      assigned_at = now(),
      assigned_by = COALESCE(auth.uid(), NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Create trigger for sync
DROP TRIGGER IF EXISTS trigger_sync_profile_assignments ON public.profiles;
CREATE TRIGGER trigger_sync_profile_assignments
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_assignments();

-- 9. Update existing profiles without assignments
DO $$
DECLARE
  _default_profile_id UUID;
  _user_record RECORD;
BEGIN
  -- Get default profile
  SELECT id INTO _default_profile_id 
  FROM public.access_profiles 
  WHERE name = 'Membro' AND is_active = true
  LIMIT 1;
  
  IF _default_profile_id IS NOT NULL THEN
    -- Update profiles without profile_id
    FOR _user_record IN 
      SELECT id FROM public.profiles WHERE profile_id IS NULL
    LOOP
      -- Update profile
      UPDATE public.profiles 
      SET profile_id = _default_profile_id 
      WHERE id = _user_record.id;
      
      -- Create assignment
      INSERT INTO public.user_profile_assignments (user_id, profile_id, assigned_by)
      VALUES (_user_record.id, _default_profile_id, _user_record.id)
      ON CONFLICT (user_id, profile_id) DO NOTHING;
    END LOOP;
  END IF;
END;
$$;