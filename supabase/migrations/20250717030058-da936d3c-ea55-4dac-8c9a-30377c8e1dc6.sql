-- Add banner_image_url column to church_events table
ALTER TABLE public.church_events 
ADD COLUMN banner_image_url TEXT;

-- Create storage bucket for event banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true);

-- Create storage policies for event banners
CREATE POLICY "Event banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-banners');

CREATE POLICY "Authenticated users can upload event banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update event banners" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'event-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete event banners" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'event-banners' AND auth.role() = 'authenticated');