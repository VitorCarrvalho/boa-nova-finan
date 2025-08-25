-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create ENUM types
CREATE TYPE service_provider_status AS ENUM ('pending', 'approved', 'rejected', 'inactive');
CREATE TYPE service_review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE contact_click_channel AS ENUM ('whatsapp', 'email', 'instagram', 'linkedin', 'reveal_contact');

-- Create service_categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  category_id UUID NOT NULL REFERENCES public.service_categories(id),
  instagram TEXT,
  linkedin TEXT,
  website TEXT,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  congregation_id UUID REFERENCES public.congregations(id),
  congregation_name TEXT,
  photo_url TEXT NOT NULL,
  status service_provider_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_reviews table
CREATE TABLE public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  reviewer_email TEXT,
  status service_review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_reports table
CREATE TABLE public.service_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  reporter_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_contact_clicks table
CREATE TABLE public.service_contact_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  channel contact_click_channel NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_service_providers_status ON public.service_providers(status);
CREATE INDEX idx_service_providers_category ON public.service_providers(category_id);
CREATE INDEX idx_service_providers_city_state ON public.service_providers(city, state);
CREATE INDEX idx_service_providers_congregation ON public.service_providers(congregation_id);
CREATE INDEX idx_service_reviews_provider ON public.service_reviews(provider_id);
CREATE INDEX idx_service_reports_provider ON public.service_reports(provider_id);
CREATE INDEX idx_service_contact_clicks_provider ON public.service_contact_clicks(provider_id);

-- Create trigram index for fuzzy search
CREATE INDEX idx_service_providers_trgm ON public.service_providers USING gin ((name || ' ' || description) gin_trgm_ops);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_service_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_service_updated_at_column();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_provider_slug(provider_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Create base slug from name
  base_slug := lower(trim(regexp_replace(provider_name, '[^a-zA-Z0-9\s]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.service_providers WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug on insert
CREATE OR REPLACE FUNCTION public.auto_generate_provider_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_provider_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for auto slug generation
CREATE TRIGGER auto_generate_provider_slug_trigger
  BEFORE INSERT ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_provider_slug();

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_contact_clicks ENABLE ROW LEVEL SECURITY;

-- service_categories policies
CREATE POLICY "Public can view active categories" 
ON public.service_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.service_categories 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- service_providers policies
CREATE POLICY "Public can view approved providers" 
ON public.service_providers 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Anyone can submit providers" 
ON public.service_providers 
FOR INSERT 
WITH CHECK (status = 'pending' AND terms_accepted = true);

CREATE POLICY "Admins can manage all providers" 
ON public.service_providers 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- service_reviews policies
CREATE POLICY "Public can view approved reviews" 
ON public.service_reviews 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Anyone can submit reviews" 
ON public.service_reviews 
FOR INSERT 
WITH CHECK (status = 'pending');

CREATE POLICY "Admins can manage reviews" 
ON public.service_reviews 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- service_reports policies
CREATE POLICY "Anyone can submit reports" 
ON public.service_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view reports" 
ON public.service_reports 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- service_contact_clicks policies
CREATE POLICY "Anyone can log contact clicks" 
ON public.service_contact_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view contact metrics" 
ON public.service_contact_clicks 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Insert some default categories
INSERT INTO public.service_categories (name) VALUES
('Consultoria e Negócios'),
('Tecnologia e Informática'),
('Saúde e Bem-estar'),
('Educação e Ensino'),
('Arte e Design'),
('Construção e Reformas'),
('Beleza e Estética'),
('Alimentação e Gastronomia'),
('Fotografia e Vídeo'),
('Música e Eventos'),
('Limpeza e Organização'),
('Transporte e Logística'),
('Jurídico e Contabilidade'),
('Marketing e Publicidade'),
('Moda e Vestuário');