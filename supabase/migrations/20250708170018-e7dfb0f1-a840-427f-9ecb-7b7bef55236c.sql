-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create access profiles table
CREATE TABLE public.access_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access_profiles
ALTER TABLE public.access_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for access profiles
CREATE POLICY "Admins can manage access profiles" 
ON public.access_profiles 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_access_profiles_updated_at
BEFORE UPDATE ON public.access_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default profiles
INSERT INTO public.access_profiles (name, description, permissions) VALUES
('Admin', 'Acesso total ao sistema', '{"dashboard": {"view": true, "insert": true, "edit": true, "delete": true}, "financeiro": {"view": true, "insert": true, "edit": true, "delete": true}, "membros": {"view": true, "insert": true, "edit": true, "delete": true}, "eventos": {"view": true, "insert": true, "edit": true, "delete": true}, "congregacoes": {"view": true, "insert": true, "edit": true, "delete": true}, "ministerios": {"view": true, "insert": true, "edit": true, "delete": true}, "departamentos": {"view": true, "insert": true, "edit": true, "delete": true}, "fornecedores": {"view": true, "insert": true, "edit": true, "delete": true}, "relatorios": {"view": true, "insert": true, "edit": true, "delete": true}, "notificacoes": {"view": true, "insert": true, "edit": true, "delete": true}, "conciliacoes": {"view": true, "insert": true, "edit": true, "delete": true}}'),
('Pastor', 'Acesso pastoral completo', '{"dashboard": {"view": true, "insert": false, "edit": false, "delete": false}, "financeiro": {"view": true, "insert": true, "edit": true, "delete": false}, "membros": {"view": true, "insert": true, "edit": true, "delete": false}, "eventos": {"view": true, "insert": true, "edit": true, "delete": false}, "congregacoes": {"view": true, "insert": false, "edit": true, "delete": false}, "ministerios": {"view": true, "insert": true, "edit": true, "delete": false}, "departamentos": {"view": true, "insert": true, "edit": true, "delete": false}, "fornecedores": {"view": true, "insert": false, "edit": false, "delete": false}, "relatorios": {"view": true, "insert": false, "edit": false, "delete": false}, "notificacoes": {"view": true, "insert": true, "edit": true, "delete": false}, "conciliacoes": {"view": true, "insert": true, "edit": true, "delete": false}}'),
('Membro', 'Acesso básico para membros', '{"dashboard": {"view": true, "insert": false, "edit": false, "delete": false}, "financeiro": {"view": false, "insert": false, "edit": false, "delete": false}, "membros": {"view": true, "insert": false, "edit": false, "delete": false}, "eventos": {"view": true, "insert": false, "edit": false, "delete": false}, "congregacoes": {"view": true, "insert": false, "edit": false, "delete": false}, "ministerios": {"view": true, "insert": false, "edit": false, "delete": false}, "departamentos": {"view": true, "insert": false, "edit": false, "delete": false}, "fornecedores": {"view": false, "insert": false, "edit": false, "delete": false}, "relatorios": {"view": false, "insert": false, "edit": false, "delete": false}, "notificacoes": {"view": true, "insert": false, "edit": false, "delete": false}, "conciliacoes": {"view": false, "insert": false, "edit": false, "delete": false}}');

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, congregation_id, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data ->> 'congregation_id')::uuid,
    'pending'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();