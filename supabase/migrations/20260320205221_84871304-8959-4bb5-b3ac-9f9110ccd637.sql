
-- Create member-photos bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anon to upload to member-photos
CREATE POLICY "Anon can upload member photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'member-photos');

-- Allow public read access
CREATE POLICY "Public can view member photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'member-photos');
