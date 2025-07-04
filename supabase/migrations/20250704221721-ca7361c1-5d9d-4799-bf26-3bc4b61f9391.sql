
-- Criar tabela de congregações
CREATE TABLE public.congregations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT,
  responsible_pastor_ids UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  cep TEXT,
  street TEXT,
  number TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  complement TEXT,
  avg_members INTEGER,
  has_own_property BOOLEAN DEFAULT false,
  rent_value DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de conciliações
CREATE TABLE public.reconciliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  congregation_id UUID NOT NULL REFERENCES public.congregations(id),
  month DATE NOT NULL,
  total_income DECIMAL NOT NULL DEFAULT 0,
  amount_to_send DECIMAL NOT NULL DEFAULT 0, -- 15% calculado automaticamente
  sent_date DATE,
  sent_by UUID,
  pix DECIMAL DEFAULT 0,
  online_pix DECIMAL DEFAULT 0,
  debit DECIMAL DEFAULT 0,
  credit DECIMAL DEFAULT 0,
  cash DECIMAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de membros para incluir congregation_id
ALTER TABLE public.members 
ADD COLUMN congregation_id UUID REFERENCES public.congregations(id);

-- Atualizar tabela de registros financeiros para incluir congregation_id
ALTER TABLE public.financial_records 
ADD COLUMN congregation_id UUID REFERENCES public.congregations(id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.congregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para congregações
CREATE POLICY "Todos usuários autenticados podem ver congregações" 
  ON public.congregations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins e pastors podem gerenciar congregações" 
  ON public.congregations 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role, 'pastor'::user_role]));

-- Políticas RLS para conciliações
CREATE POLICY "Usuários podem ver conciliações de suas congregações" 
  ON public.reconciliations 
  FOR SELECT 
  USING (
    get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]) OR
    (get_current_user_role() = 'finance'::user_role) OR
    (get_current_user_role() = 'pastor'::user_role)
  );

CREATE POLICY "Finance e admins podem gerenciar conciliações" 
  ON public.reconciliations 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role, 'finance'::user_role]));

-- Criar função para calcular automaticamente o valor a enviar (15%)
CREATE OR REPLACE FUNCTION calculate_amount_to_send()
RETURNS TRIGGER AS $$
BEGIN
  NEW.amount_to_send = NEW.total_income * 0.15;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente o amount_to_send
CREATE TRIGGER trigger_calculate_amount_to_send
  BEFORE INSERT OR UPDATE ON public.reconciliations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_amount_to_send();
