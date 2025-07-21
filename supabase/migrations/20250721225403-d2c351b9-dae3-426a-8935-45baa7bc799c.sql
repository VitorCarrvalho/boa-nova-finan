
-- Create policy to allow public access to active events
CREATE POLICY "Public can view active events"
ON public.church_events
FOR SELECT
TO public
USING (is_active = true);
