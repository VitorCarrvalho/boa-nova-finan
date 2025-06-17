
-- Criar enum para tipos de usuário do sistema
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'finance', 'pastor', 'worker');

-- Criar enum para papéis de membros da igreja
CREATE TYPE public.member_role AS ENUM ('member', 'worker', 'pastor');

-- Criar enum para tipos de transação financeira
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Criar enum para categorias financeiras
CREATE TYPE public.financial_category AS ENUM (
  'tithe', 'offering', 'online_offering', 'vow_offering', 'event', 
  'debt_paid', 'salary', 'maintenance', 'supplier', 'project', 'utility'
);

-- Criar enum para métodos de pagamento
CREATE TYPE public.payment_method AS ENUM ('cash', 'coin', 'pix', 'debit', 'credit');

-- Criar enum para tipos de eventos
CREATE TYPE public.event_type AS ENUM ('culto', 'conferencia', 'reuniao', 'evento_especial');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'worker',
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rg TEXT,
  cpf TEXT,
  date_of_baptism DATE,
  date_of_joining DATE,
  role member_role NOT NULL DEFAULT 'member',
  ministries TEXT[],
  phone TEXT,
  email TEXT,
  address TEXT,
  education TEXT,
  photo_url TEXT,
  instagram TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ministérios
CREATE TABLE public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT, -- CPF ou CNPJ
  services TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de registros financeiros
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type transaction_type NOT NULL,
  category financial_category NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method payment_method NOT NULL,
  event_type TEXT,
  event_date DATE,
  attendees INTEGER,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de departamentos
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.members(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos da igreja
CREATE TABLE public.church_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  type event_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Função para obter o papel do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() IN ('superadmin', 'admin'));

-- Políticas RLS para members
CREATE POLICY "Todos usuários autenticados podem ver membros" ON public.members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Pastors e admins podem inserir membros" ON public.members
  FOR INSERT TO authenticated 
  WITH CHECK (public.get_current_user_role() IN ('superadmin', 'admin', 'pastor'));

CREATE POLICY "Pastors e admins podem atualizar membros" ON public.members
  FOR UPDATE TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'pastor'));

CREATE POLICY "Apenas superadmins podem deletar membros" ON public.members
  FOR DELETE TO authenticated 
  USING (public.get_current_user_role() = 'superadmin');

-- Políticas RLS para financial_records
CREATE POLICY "Finance, admin e superadmin podem ver registros financeiros" ON public.financial_records
  FOR SELECT TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'finance'));

CREATE POLICY "Finance, admin e superadmin podem inserir registros financeiros" ON public.financial_records
  FOR INSERT TO authenticated 
  WITH CHECK (public.get_current_user_role() IN ('superadmin', 'admin', 'finance'));

CREATE POLICY "Finance, admin e superadmin podem atualizar registros financeiros" ON public.financial_records
  FOR UPDATE TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'finance'));

CREATE POLICY "Apenas superadmins podem deletar registros financeiros" ON public.financial_records
  FOR DELETE TO authenticated 
  USING (public.get_current_user_role() = 'superadmin');

-- Políticas similares para outras tabelas
CREATE POLICY "Todos usuários autenticados podem ver ministérios" ON public.ministries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins e pastors podem gerenciar ministérios" ON public.ministries
  FOR ALL TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'pastor'));

CREATE POLICY "Todos usuários autenticados podem ver departamentos" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins e pastors podem gerenciar departamentos" ON public.departments
  FOR ALL TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'pastor'));

CREATE POLICY "Todos usuários autenticados podem ver eventos" ON public.church_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins e pastors podem gerenciar eventos" ON public.church_events
  FOR ALL TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'pastor'));

CREATE POLICY "Finance, admin e superadmin podem ver fornecedores" ON public.suppliers
  FOR SELECT TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'finance'));

CREATE POLICY "Finance, admin e superadmin podem gerenciar fornecedores" ON public.suppliers
  FOR ALL TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin', 'finance'));

-- Políticas para audit_logs
CREATE POLICY "Admins podem ver logs de auditoria" ON public.audit_logs
  FOR SELECT TO authenticated 
  USING (public.get_current_user_role() IN ('superadmin', 'admin'));

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'worker'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, previous_value, new_value)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action_type, table_name, record_id, new_value)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoria
CREATE TRIGGER audit_members AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_financial_records AFTER INSERT OR UPDATE OR DELETE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_ministries AFTER INSERT OR UPDATE OR DELETE ON public.ministries
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_departments AFTER INSERT OR UPDATE OR DELETE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_suppliers AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER audit_church_events AFTER INSERT OR UPDATE OR DELETE ON public.church_events
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();
