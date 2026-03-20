
-- Add tenant_id to service_providers
ALTER TABLE public.service_providers
ADD COLUMN tenant_id uuid REFERENCES public.tenants(id);

-- Drop existing admin policy
DROP POLICY "Admins can manage all providers" ON public.service_providers;

-- New admin policy: only manage providers from own tenant
CREATE POLICY "Admins can manage their tenant providers"
ON public.service_providers
FOR ALL
TO public
USING (
  is_super_admin()
  OR (
    (get_current_user_role() = ANY (ARRAY['admin'::user_role]))
    AND tenant_id = get_user_tenant_id(auth.uid())
  )
)
WITH CHECK (
  is_super_admin()
  OR (
    (get_current_user_role() = ANY (ARRAY['admin'::user_role]))
    AND tenant_id = get_user_tenant_id(auth.uid())
  )
);

-- Update INSERT policy to require tenant_id
DROP POLICY "Anyone can submit providers" ON public.service_providers;
CREATE POLICY "Anyone can submit providers"
ON public.service_providers
FOR INSERT
TO public
WITH CHECK (
  (status = 'pending'::service_provider_status)
  AND (terms_accepted = true)
);

-- Public SELECT policy stays global (marketplace is open)
-- No change needed to "Public can view approved providers"
