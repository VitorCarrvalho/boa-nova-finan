
-- Add supplier_id and responsible_pastor_id to financial_records table
ALTER TABLE public.financial_records 
ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id),
ADD COLUMN responsible_pastor_id uuid REFERENCES public.members(id);

-- Create index for better performance
CREATE INDEX idx_financial_records_supplier ON public.financial_records(supplier_id);
CREATE INDEX idx_financial_records_pastor ON public.financial_records(responsible_pastor_id);

-- Add a special congregation ID for headquarters
INSERT INTO public.congregations (id, name, is_active, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000100', 'Sede', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Update financial_records to use congregation_id = 100 UUID for headquarters records that are null
UPDATE public.financial_records 
SET congregation_id = '00000000-0000-0000-0000-000000000100'
WHERE congregation_id IS NULL;
