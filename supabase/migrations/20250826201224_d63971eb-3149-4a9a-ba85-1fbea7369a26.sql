-- Allow unauthenticated users to upload to pending folder in profile-pictures bucket
CREATE POLICY "Allow unauthenticated uploads to pending folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND name LIKE 'pending/%'
  AND auth.uid() IS NULL
);