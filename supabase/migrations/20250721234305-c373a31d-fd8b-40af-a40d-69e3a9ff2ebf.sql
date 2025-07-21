-- Create documentation_sections table
CREATE TABLE public.documentation_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  module_key TEXT,
  section_order INTEGER NOT NULL DEFAULT 0,
  parent_section_id UUID REFERENCES public.documentation_sections(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentation_sections ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT - all authenticated users can view active documentation
CREATE POLICY "Authenticated users can view active documentation"
  ON public.documentation_sections
  FOR SELECT
  USING (is_active = true);

-- Policy for INSERT - only admins can create documentation
CREATE POLICY "Admins can create documentation"
  ON public.documentation_sections
  FOR INSERT
  WITH CHECK (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Policy for UPDATE - only admins can update documentation
CREATE POLICY "Admins can update documentation"
  ON public.documentation_sections
  FOR UPDATE
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Policy for DELETE - only admins can delete documentation
CREATE POLICY "Admins can delete documentation"
  ON public.documentation_sections
  FOR DELETE
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Add updated_at trigger
CREATE TRIGGER update_documentation_sections_updated_at
  BEFORE UPDATE ON public.documentation_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial documentation content (only first few for brevity)
INSERT INTO public.documentation_sections (title, content, module_key, section_order, parent_section_id) VALUES
('Visão Geral do Sistema', '# Visão Geral do Sistema

O Sistema de Gestão da Igreja é uma plataforma completa desenvolvida para auxiliar na administração e organização das atividades eclesiásticas.

## Propósito
Este sistema foi criado para centralizar e otimizar os processos administrativos da igreja, incluindo:
- Gestão financeira
- Controle de membros
- Organização de eventos
- Acompanhamento de congregações
- Gestão de contas a pagar
- Relatórios gerenciais

## Arquitetura
O sistema é baseado em uma arquitetura moderna web com:
- Frontend em React/TypeScript
- Backend Supabase (PostgreSQL)
- Autenticação segura
- Políticas de segurança em nível de linha (RLS)

## Perfis de Usuário
O sistema suporta diferentes perfis de acesso com permissões específicas para cada módulo.', null, 1, null),

('Dashboard', '# Dashboard

O Dashboard é a página inicial do sistema após o login, fornecendo uma visão geral das principais métricas e atividades.

## Funcionalidades
- **Métricas de Membros**: Gráfico mostrando crescimento de membros ao longo do tempo
- **Resumo Financeiro**: Visão geral das receitas e despesas recentes
- **Eventos Próximos**: Lista dos próximos eventos programados
- **Indicadores Gerais**: KPIs importantes do sistema

## Como Usar
1. Após fazer login, você será direcionado automaticamente ao Dashboard
2. Use os gráficos para acompanhar tendências
3. Clique nos widgets para acessar módulos específicos
4. Os dados são atualizados automaticamente', 'dashboard', 2, null),

('Financeiro', '# Módulo Financeiro

O módulo Financeiro permite o controle completo das receitas e despesas da igreja.

## Tipos de Transações
- **Receitas**: Dízimos, ofertas, doações especiais
- **Despesas**: Gastos operacionais, pagamentos a fornecedores

## Categorias Disponíveis
- Dízimos
- Ofertas
- Doações Especiais
- Despesas Operacionais
- Pagamentos a Fornecedores

## Como Registrar uma Transação
1. Acesse o módulo Financeiro no menu lateral
2. Clique em "Nova Transação"
3. Selecione o tipo (Receita/Despesa)
4. Escolha a categoria apropriada
5. Informe o valor e método de pagamento
6. Adicione descrição detalhada
7. Se for evento, vincule ao evento correspondente
8. Salve a transação

## Métodos de Pagamento
- Dinheiro
- PIX
- Cartão de Débito
- Cartão de Crédito
- Transferência Bancária

## Relatórios
- Relatório de receitas por período
- Relatório de despesas por categoria
- Demonstrativo financeiro consolidado', 'financeiro', 3, null);