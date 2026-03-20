-- Update DELETE policy on members to allow tenant admins
DROP POLICY IF EXISTS "Apenas superadmins podem deletar membros" ON public.members;
CREATE POLICY "Admins podem deletar membros do tenant"
ON public.members
FOR DELETE
TO authenticated
USING (
  is_super_admin()
  OR (
    get_current_user_role() = 'admin'::user_role
    AND tenant_id = get_user_tenant_id(auth.uid())
  )
);

-- Update DELETE policy on financial_records to allow tenant admins
DROP POLICY IF EXISTS "Apenas superadmins podem deletar registros financeiros" ON public.financial_records;
CREATE POLICY "Admins podem deletar registros financeiros do tenant"
ON public.financial_records
FOR DELETE
TO authenticated
USING (
  is_super_admin()
  OR (
    get_current_user_role() = 'admin'::user_role
    AND tenant_id = get_user_tenant_id(auth.uid())
  )
);