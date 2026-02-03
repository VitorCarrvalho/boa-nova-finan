-- Create bucket for tenant logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-logos', 
  'tenant-logos', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Super admins can upload logos
CREATE POLICY "Super admins can upload tenant logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-logos' 
  AND public.is_super_admin(auth.uid())
);

-- Policy: Super admins can update logos
CREATE POLICY "Super admins can update tenant logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-logos' 
  AND public.is_super_admin(auth.uid())
);

-- Policy: Super admins can delete logos
CREATE POLICY "Super admins can delete tenant logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-logos' 
  AND public.is_super_admin(auth.uid())
);

-- Policy: Anyone can view tenant logos (public bucket)
CREATE POLICY "Anyone can view tenant logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tenant-logos');