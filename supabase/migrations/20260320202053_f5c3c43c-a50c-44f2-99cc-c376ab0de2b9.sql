
-- Add approval_status to members table
ALTER TABLE public.members
ADD COLUMN approval_status text NOT NULL DEFAULT 'approved';

-- Allow anon to insert members with pending status (public registration)
CREATE POLICY "Anon can submit member registration"
ON public.members
FOR INSERT
TO anon
WITH CHECK (approval_status = 'pending' AND is_active = false);

-- Allow anon to read congregations for the public form
CREATE POLICY "Anon can view active congregations"
ON public.congregations
FOR SELECT
TO anon
USING (is_active = true);

-- Allow anon to read ministries for the public form
CREATE POLICY "Anon can view active ministries"
ON public.ministries
FOR SELECT
TO anon
USING (true);
