ALTER TABLE public.profiles 
  DROP CONSTRAINT profiles_profile_id_fkey;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_profile_id_fkey 
  FOREIGN KEY (profile_id) 
  REFERENCES public.access_profiles(id) 
  ON DELETE SET NULL;