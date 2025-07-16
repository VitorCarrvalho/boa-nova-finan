-- Fix RLS INSERT policy for reconciliations to include sent_by field

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Usuários com permissão podem criar conciliações" ON public.reconciliations;

-- Create new INSERT policy with proper sent_by handling
CREATE POLICY "Usuários com permissão podem criar conciliações" ON public.reconciliations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_permission('conciliacoes'::text, 'insert'::text) AND 
    sent_by = auth.uid()
  );

-- Ensure sent_by column has a default value of auth.uid()
ALTER TABLE public.reconciliations 
ALTER COLUMN sent_by SET DEFAULT auth.uid();

-- Make sent_by NOT NULL to prevent future issues
UPDATE public.reconciliations SET sent_by = '00000000-0000-0000-0000-000000000000' WHERE sent_by IS NULL;
ALTER TABLE public.reconciliations 
ALTER COLUMN sent_by SET NOT NULL;