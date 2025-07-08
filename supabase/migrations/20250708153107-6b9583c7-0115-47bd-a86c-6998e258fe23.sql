-- Update Vitor Carvalho's profile to Admin with full access
UPDATE public.profiles 
SET 
  role = 'admin',
  approval_status = 'approved',
  approved_at = now(),
  approved_by = id  -- Self-approved for this initial admin setup
WHERE email = 'vitor.tecc@gmail.com' AND id = '66d14607-0219-45bb-b099-83dd6d4a6a17';

-- Verify the update
SELECT id, name, email, role, approval_status, approved_at 
FROM public.profiles 
WHERE email = 'vitor.tecc@gmail.com';