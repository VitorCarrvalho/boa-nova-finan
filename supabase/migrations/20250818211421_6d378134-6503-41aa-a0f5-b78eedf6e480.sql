-- Add PIX key field to accounts_payable table
ALTER TABLE public.accounts_payable 
ADD COLUMN pix_key TEXT;