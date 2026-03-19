
ALTER TABLE public.profiles DROP CONSTRAINT profiles_congregation_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE SET NULL;
