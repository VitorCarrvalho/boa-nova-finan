
-- Adicionar foreign key entre accounts_payable.requested_by e profiles.id
ALTER TABLE public.accounts_payable 
ADD CONSTRAINT accounts_payable_requested_by_fkey 
FOREIGN KEY (requested_by) REFERENCES public.profiles(id);
