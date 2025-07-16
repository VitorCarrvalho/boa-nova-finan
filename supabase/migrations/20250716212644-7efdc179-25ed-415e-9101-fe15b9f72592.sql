-- Create audit table for attachment downloads
CREATE TABLE public.attachment_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_payable_id UUID NOT NULL REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
  downloaded_by UUID NOT NULL REFERENCES public.profiles(id),
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET
);

-- Enable RLS
ALTER TABLE public.attachment_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users with permissions can view download logs" 
ON public.attachment_downloads 
FOR SELECT 
USING (user_has_permission('contas-pagar', 'view'));

-- Create indexes for better performance
CREATE INDEX idx_attachment_downloads_account_payable_id ON public.attachment_downloads(account_payable_id);
CREATE INDEX idx_attachment_downloads_downloaded_by ON public.attachment_downloads(downloaded_by);
CREATE INDEX idx_attachment_downloads_downloaded_at ON public.attachment_downloads(downloaded_at);