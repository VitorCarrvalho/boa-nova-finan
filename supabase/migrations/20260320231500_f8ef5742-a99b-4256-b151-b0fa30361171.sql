
-- Add management columns to pedidos_oracao
ALTER TABLE public.pedidos_oracao
  ADD COLUMN is_read boolean NOT NULL DEFAULT false,
  ADD COLUMN is_followed boolean NOT NULL DEFAULT false,
  ADD COLUMN read_at timestamptz,
  ADD COLUMN read_by uuid;

-- Policy: Admins can update tenant prayer requests
CREATE POLICY "Admins can update tenant prayer requests"
ON public.pedidos_oracao
FOR UPDATE
TO authenticated
USING (
  is_current_user_org_admin()
  AND tenant_id = get_user_tenant_id(auth.uid())
)
WITH CHECK (
  is_current_user_org_admin()
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Policy: Admins can delete tenant prayer requests
CREATE POLICY "Admins can delete tenant prayer requests"
ON public.pedidos_oracao
FOR DELETE
TO authenticated
USING (
  is_current_user_org_admin()
  AND tenant_id = get_user_tenant_id(auth.uid())
);
