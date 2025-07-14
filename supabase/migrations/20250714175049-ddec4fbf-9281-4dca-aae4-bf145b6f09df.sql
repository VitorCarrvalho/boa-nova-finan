-- Criar módulo Contas a Pagar
-- Estrutura de dados completa

-- 1. Criar tabela de categorias de despesas
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão do mercado
INSERT INTO public.expense_categories (name, description) VALUES
('Aluguel e Condomínio', 'Despesas com aluguel de imóveis e taxas condominiais'),
('Água, Luz e Telefone', 'Despesas com serviços públicos e telecomunicações'),
('Material de Escritório', 'Papelaria, materiais de escritório e suprimentos'),
('Material de Limpeza', 'Produtos de limpeza e higienização'),
('Combustível e Transporte', 'Combustível, passagens e despesas de transporte'),
('Marketing e Publicidade', 'Propaganda, marketing digital e material gráfico'),
('Serviços Terceirizados', 'Serviços de terceiros e consultorias'),
('Manutenção e Reparos', 'Manutenção de equipamentos e reparos em geral'),
('Equipamentos e Mobiliário', 'Compra de equipamentos, móveis e utensílios'),
('Impostos e Taxas', 'Impostos, taxas governamentais e contribuições'),
('Seguros', 'Seguros diversos (predial, veicular, etc.)'),
('Consultoria e Assessoria', 'Serviços de consultoria especializada'),
('Despesas Bancárias', 'Tarifas bancárias e custos financeiros'),
('Outras Despesas', 'Despesas diversas não categorizadas');

-- 2. Criar ENUM para status das contas
CREATE TYPE public.account_payable_status AS ENUM (
  'pending_management',
  'pending_director', 
  'pending_president',
  'approved',
  'paid',
  'rejected'
);

-- 3. Criar ENUM para urgência
CREATE TYPE public.urgency_level AS ENUM (
  'normal',
  'urgent'
);

-- 4. Criar tabela principal de contas a pagar
CREATE TABLE public.accounts_payable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campos obrigatórios
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  payee_name TEXT NOT NULL,
  
  -- Dados bancários do favorecido
  bank_name TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  
  -- Centro de custo
  congregation_id UUID NOT NULL REFERENCES public.congregations(id),
  
  -- Comprovante (após aprovação)
  attachment_url TEXT,
  attachment_filename TEXT,
  
  -- Observações e dados adicionais
  observations TEXT,
  invoice_number TEXT,
  
  -- Recorrência
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_frequency TEXT DEFAULT 'monthly',
  
  -- Solicitante e data
  requested_by UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Status atual
  status public.account_payable_status NOT NULL DEFAULT 'pending_management',
  
  -- Urgência
  urgency_level public.urgency_level NOT NULL DEFAULT 'normal',
  urgency_description TEXT,
  
  -- Datas de controle
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Criar tabela de histórico de aprovações
CREATE TABLE public.accounts_payable_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_payable_id UUID NOT NULL REFERENCES public.accounts_payable(id) ON DELETE CASCADE,
  
  -- Aprovador
  approved_by UUID NOT NULL,
  approval_level TEXT NOT NULL, -- 'management', 'director', 'president'
  
  -- Ação realizada
  action TEXT NOT NULL, -- 'approved', 'rejected'
  notes TEXT,
  
  -- Data da ação
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Criar storage bucket para anexos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('accounts-payable-attachments', 'accounts-payable-attachments', false);

-- 7. Habilitar RLS nas tabelas
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable_approvals ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para expense_categories
CREATE POLICY "Todos podem ver categorias ativas" 
ON public.expense_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins podem gerenciar categorias" 
ON public.expense_categories 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- 9. Políticas RLS para accounts_payable
CREATE POLICY "Usuários podem ver contas de suas congregações ou que solicitaram" 
ON public.accounts_payable 
FOR SELECT 
USING (
  get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]) OR
  requested_by = auth.uid() OR
  (get_current_user_role() = ANY (ARRAY['pastor'::user_role, 'finance'::user_role, 'gerente'::user_role, 'diretor'::user_role, 'presidente'::user_role]))
);

CREATE POLICY "Perfis autorizados podem criar contas" 
ON public.accounts_payable 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['assistente'::user_role, 'analista'::user_role, 'gerente'::user_role, 'pastor'::user_role]) AND
  requested_by = auth.uid()
);

CREATE POLICY "Criador ou aprovadores podem atualizar contas" 
ON public.accounts_payable 
FOR UPDATE 
USING (
  get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]) OR
  requested_by = auth.uid() OR
  (get_current_user_role() = ANY (ARRAY['gerente'::user_role, 'diretor'::user_role, 'presidente'::user_role, 'finance'::user_role]))
);

CREATE POLICY "Apenas superadmins podem deletar contas" 
ON public.accounts_payable 
FOR DELETE 
USING (get_current_user_role() = 'superadmin'::user_role);

-- 10. Políticas RLS para accounts_payable_approvals
CREATE POLICY "Usuários podem ver aprovações de contas que têm acesso" 
ON public.accounts_payable_approvals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.accounts_payable ap 
    WHERE ap.id = account_payable_id AND (
      get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]) OR
      ap.requested_by = auth.uid() OR
      (get_current_user_role() = ANY (ARRAY['pastor'::user_role, 'finance'::user_role, 'gerente'::user_role, 'diretor'::user_role, 'presidente'::user_role]))
    )
  )
);

CREATE POLICY "Aprovadores podem inserir aprovações" 
ON public.accounts_payable_approvals 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['gerente'::user_role, 'diretor'::user_role, 'presidente'::user_role, 'admin'::user_role, 'superadmin'::user_role]) AND
  approved_by = auth.uid()
);

-- 11. Políticas de storage para anexos
CREATE POLICY "Usuários podem ver anexos de contas que têm acesso" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'accounts-payable-attachments' AND
  (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role, 'finance'::user_role, 'gerente'::user_role, 'diretor'::user_role, 'presidente'::user_role, 'analista'::user_role, 'assistente'::user_role]))
);

CREATE POLICY "Usuários autorizados podem fazer upload de anexos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'accounts-payable-attachments' AND
  (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role, 'finance'::user_role, 'gerente'::user_role, 'analista'::user_role, 'assistente'::user_role, 'pastor'::user_role]))
);

CREATE POLICY "Usuários autorizados podem atualizar anexos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'accounts-payable-attachments' AND
  (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role, 'finance'::user_role]))
);

-- 12. Criar trigger para updated_at
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_payable_updated_at
BEFORE UPDATE ON public.accounts_payable
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Criar triggers de auditoria
CREATE TRIGGER log_expense_categories_changes
AFTER INSERT OR UPDATE OR DELETE ON public.expense_categories
FOR EACH ROW
EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER log_accounts_payable_changes
AFTER INSERT OR UPDATE OR DELETE ON public.accounts_payable
FOR EACH ROW
EXECUTE FUNCTION public.log_changes();

CREATE TRIGGER log_accounts_payable_approvals_changes
AFTER INSERT OR UPDATE OR DELETE ON public.accounts_payable_approvals
FOR EACH ROW
EXECUTE FUNCTION public.log_changes();