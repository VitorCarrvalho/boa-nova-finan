
-- Add tenant_id column to pedidos_oracao
ALTER TABLE public.pedidos_oracao
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Anon users can insert prayer requests" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Authenticated users can insert prayer requests" ON public.pedidos_oracao;
DROP POLICY IF EXISTS "Only admins can view prayer requests" ON public.pedidos_oracao;

-- Recreate INSERT policies (allow tenant_id to be set)
CREATE POLICY "Anon users can insert prayer requests"
ON public.pedidos_oracao FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert prayer requests"
ON public.pedidos_oracao FOR INSERT TO authenticated
WITH CHECK (true);

-- SELECT: admins can view only their tenant's prayer requests
CREATE POLICY "Admins can view tenant prayer requests"
ON public.pedidos_oracao FOR SELECT TO authenticated
USING (
  is_super_admin() OR (
    is_current_user_org_admin() AND (
      (tenant_id = get_user_tenant_id(auth.uid())) OR
      (tenant_id IS NULL AND get_user_tenant_id(auth.uid()) IS NULL)
    )
  )
);
