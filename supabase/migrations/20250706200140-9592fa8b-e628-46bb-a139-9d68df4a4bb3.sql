
-- Add responsible_pastor_id column to financial_records table
ALTER TABLE public.financial_records 
ADD COLUMN responsible_pastor_id uuid REFERENCES public.members(id);

-- Create index for better performance on responsible_pastor_id
CREATE INDEX idx_financial_records_responsible_pastor ON public.financial_records(responsible_pastor_id);

-- Update existing records to have a default responsible pastor if needed
-- This is optional - you may want to leave existing records with NULL values
-- UPDATE public.financial_records 
-- SET responsible_pastor_id = (
--   SELECT id FROM public.members 
--   WHERE role = 'pastor' AND is_active = true 
--   LIMIT 1
-- ) 
-- WHERE responsible_pastor_id IS NULL;
