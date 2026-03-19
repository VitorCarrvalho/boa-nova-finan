ALTER TABLE public.tenants 
ADD COLUMN dns_status text NOT NULL DEFAULT 'pending',
ADD COLUMN dns_checked_at timestamp with time zone;