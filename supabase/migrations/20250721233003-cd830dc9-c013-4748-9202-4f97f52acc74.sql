
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

-- Insert initial documentation content
INSERT INTO public.documentation_sections (title, content, module_key, section_order, parent_section_id) VALUES
-- Root sections
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
- Demonstrativo financeiro consolidado', 'financeiro', 3, null),

('Membros', '# Módulo de Membros

Sistema completo para gestão da membresia da igreja.

## Cadastro de Novos Membros
1. Acesse Membros → Novo Membro
2. Preencha os dados pessoais obrigatórios:
   - Nome completo
   - CPF (opcional)
   - RG (opcional)
   - Telefone
   - Email
3. Dados complementares:
   - Endereço
   - Data de batismo
   - Data de ingresso na igreja
   - Educação
   - Instagram
4. Selecione a congregação
5. Atribua ministérios (se aplicável)
6. Faça upload da foto (opcional)
7. Salve o cadastro

## Gestão de Ministérios
- Cada membro pode participar de múltiplos ministérios
- A atribuição é feita durante o cadastro ou edição
- Apenas usuários com permissão podem alterar ministérios

## Status do Membro
- **Ativo**: Membro regular participante
- **Inativo**: Membro temporariamente afastado

## Campos Obrigatórios vs Opcionais
**Obrigatórios:**
- Nome
- Telefone
- Email

**Opcionais:**
- CPF, RG
- Endereço completo
- Datas de batismo e ingresso
- Foto, Instagram, educação', 'membros', 4, null),

('Eventos', '# Módulo de Eventos

Gestão completa de eventos da igreja com controle de inscrições.

## Tipos de Eventos Suportados
- Culto Dominical
- Reunião de Oração
- Estudo Bíblico
- Evento Especial
- Conferência
- Retiro
- Outros

## Processo de Criação
1. Acesse Eventos → Novo Evento
2. Defina título e descrição
3. Selecione o tipo de evento
4. Configure data e horário
5. Defina local
6. Configure organizador
7. Defina limite de participantes (opcional)
8. Adicione banner (opcional)
9. Adicione observações
10. Salve o evento

## Gestão de Inscrições
- Membros podem se inscrever em eventos
- Controle automático de limite de vagas
- Status de inscrição: Confirmada
- Relatório de participantes

## Banner de Eventos
- Upload de imagem personalizada
- Exibido na listagem e detalhes do evento
- Dimensões recomendadas: 1200x600px

## Organização
- Cada evento deve ter um organizador responsável
- Organizador pode ser qualquer membro cadastrado
- Usado para controle e comunicação', 'eventos', 5, null),

('Conciliações', '# Módulo de Conciliações

Sistema para conciliação mensal das receitas das congregações.

## Processo de Conciliação
1. **Criação**: Congregação cria conciliação mensal
2. **Preenchimento**: Informa valores por método de pagamento
3. **Envio**: Submete para aprovação
4. **Aprovação**: Administrador aprova ou rejeita
5. **Finalização**: Processo concluído

## Métodos de Pagamento
- **Dinheiro**: Valores em espécie
- **PIX**: Transferências PIX
- **PIX Online**: PIX através de plataformas digitais
- **Débito**: Cartões de débito
- **Crédito**: Cartões de crédito

## Cálculo Automático
- Sistema calcula automaticamente 15% da receita total
- Valor é definido como "valor a enviar" para sede
- Cálculo: Total de Receitas × 0,15

## Status de Conciliação
- **Pendente**: Aguardando aprovação
- **Aprovada**: Aprovada pela administração
- **Rejeitada**: Rejeitada com motivo

## Validações
- Uma conciliação por congregação por mês
- Valores não podem ser negativos
- Data deve estar no mês correto

## Permissões
- Pastores podem criar conciliações de suas congregações
- Admins podem aprovar/rejeitar qualquer conciliação
- Usuários veem apenas suas próprias conciliações', 'conciliacoes', 6, null),

('Contas a Pagar', '# Módulo de Contas a Pagar

Sistema completo para gestão do fluxo de pagamentos da igreja.

## Fluxo Completo
1. **Solicitação**: Usuário cria nova conta a pagar
2. **Aprovação Gerencial**: Gerente aprova/rejeita
3. **Autorização**: Administrador autoriza pagamento
4. **Pagamento**: Conta é marcada como paga

## Status do Processo
- **Pendente de Aprovação**: Aguardando aprovação gerencial
- **Aprovada**: Aprovada pelo gerente
- **Autorizada**: Autorizada para pagamento
- **Paga**: Pagamento realizado
- **Rejeitada**: Rejeitada em qualquer etapa

## Níveis de Urgência
- **Normal**: Prazo padrão de pagamento
- **Urgente**: Requer atenção prioritária
- **Muito Urgente**: Pagamento imediato

## Dados Obrigatórios
- Descrição da despesa
- Valor
- Data de vencimento
- Categoria da despesa
- Nome do beneficiário
- Método de pagamento
- Congregação responsável

## Dados Bancários (quando aplicável)
- Nome do banco
- Agência
- Conta

## Anexos
- Upload obrigatório de comprovantes
- Formatos aceitos: PDF, imagens
- Controle de download com auditoria

## Contas Recorrentes
- Checkbox para marcar como recorrente
- Frequência: Mensal (padrão)
- Sistema pode gerar automaticamente

## Permissões por Submódulo
- **Nova Conta**: Usuários com permissão de inserção
- **Aprovação**: Gerentes financeiros
- **Autorização**: Administradores
- **Visualização**: Conforme permissões de acesso', 'contas-pagar', 7, null),

('Relatórios', '# Módulo de Relatórios

Sistema completo de relatórios gerenciais e operacionais.

## Tipos de Relatórios

### Relatórios Financeiros
- Demonstrativo de receitas e despesas
- Relatório de pagamentos a fornecedores
- Relatório de conciliações por congregação
- Gráficos de evolução financeira

### Relatórios de Membros
- Listagem completa de membros
- Relatório por congregação
- Relatório por ministério
- Estatísticas de crescimento

### Relatórios de Eventos
- Lista de eventos por período
- Relatório de participação
- Estatísticas de presença

### Relatórios de Fornecedores
- Listagem de fornecedores
- Histórico de pagamentos
- Relatório de gastos por fornecedor

### Relatórios de Conciliações
- Conciliações por período
- Status de aprovação
- Valores consolidados

## Filtros Disponíveis
- **Data**: Período específico ou predefinido
- **Congregação**: Filtro por congregação específica
- **Status**: Ativo/inativo, aprovado/pendente
- **Categoria**: Por tipo ou categoria específica

## Exportação
- **PDF**: Para impressão e arquivo
- **Excel**: Para análise de dados
- **Visualização**: Preview antes da exportação

## Gráficos e Métricas
- Gráficos de linha para evolução temporal
- Gráficos de pizza para distribuição
- Métricas consolidadas
- Comparativo entre períodos

## Como Gerar um Relatório
1. Acesse o módulo Relatórios
2. Selecione o tipo de relatório desejado
3. Configure os filtros necessários
4. Clique em "Gerar Relatório"
5. Visualize o resultado
6. Exporte se necessário', 'relatorios', 8, null),

('Notificações', '# Módulo de Notificações

Sistema para comunicação com os membros da igreja.

## Tipos de Mensagem
- **Texto**: Mensagem simples de texto
- **Vídeo**: Mensagem com vídeo da biblioteca

## Tipos de Entrega
- **Imediata**: Enviada imediatamente
- **Agendada**: Programada para data/hora específica

## Perfis de Destinatários
Selecione quais perfis receberão a notificação:
- Admin
- Pastor
- Gerente Financeiro
- Gerente de Pessoas
- Membro
- Secretário(a)
- Tesoureiro(a)
- Líder de Ministério
- Operador Financeiro

## Como Criar uma Notificação
1. Acesse Notificações → Nova Notificação
2. Selecione tipo de mensagem (Texto/Vídeo)
3. Escreva o conteúdo da mensagem
4. Se for vídeo, selecione da biblioteca
5. Escolha o tipo de entrega
6. Se agendada, defina data e hora
7. Selecione os perfis de destinatários
8. Salve ou envie a notificação

## Biblioteca de Vídeos
- Upload de vídeos para uso em notificações
- Gerenciamento apenas por administradores
- Vídeos organizados por título
- Status ativo/inativo

## Mensagens Agendadas
- Visualização de mensagens programadas
- Possibilidade de editar antes do envio
- Status de agendamento

## Histórico Enviado
- Registro de todas as mensagens enviadas
- Data e hora de envio
- Status de entrega
- Destinatários', 'notificacoes', 9, null),

('Congregações', '# Módulo de Congregações

Gestão completa das congregações da igreja.

## Cadastro de Nova Congregação
1. Acesse Congregações → Nova Congregação
2. Preencha dados básicos:
   - Nome da congregação
   - CNPJ (opcional)
3. Endereço completo:
   - CEP, rua, número
   - Cidade, estado
   - Complemento
4. Dados operacionais:
   - Pastores responsáveis
   - Média de membros
   - Situação do imóvel
5. Salve o cadastro

## Gestão de Pastores
- Cada congregação pode ter múltiplos pastores responsáveis
- Seleção a partir dos membros com perfil de Pastor
- Usado para relatórios e permissões

## Propriedades e Aluguel
- **Imóvel Próprio**: Marcar checkbox se possui
- **Aluguel**: Informar valor mensal se alugado
- Usado para cálculos financeiros

## Média de Membros
- Estimativa para planejamento
- Usado em relatórios estatísticos
- Atualizar periodicamente

## Status
- **Ativo**: Congregação em funcionamento
- **Inativo**: Congregação temporariamente fechada

## Permissões de Acesso
- Apenas usuários com permissão específica
- Finance e Worker não têm acesso
- Admin e Superadmin têm acesso total
- Pastores veem apenas suas congregações', 'congregacoes', 10, null),

('Ministérios', '# Módulo de Ministérios

Organização dos ministérios da igreja.

## Cadastro de Ministério
1. Acesse Ministérios → Novo Ministério
2. Informe nome do ministério
3. Adicione descrição detalhada
4. Selecione líder responsável
5. Salve o cadastro

## Gestão de Liderança
- Cada ministério tem um líder principal
- Líder deve ser um membro cadastrado
- Mudança de liderança através da edição

## Vinculação com Membros
- Membros são vinculados durante cadastro/edição
- Um membro pode participar de vários ministérios
- Relatórios por ministério disponíveis

## Exemplos de Ministérios
- Louvor e Adoração
- Ensino Infantil
- Juventude
- Mulheres
- Homens
- Evangelismo
- Ação Social
- Comunicação

## Relatórios
- Lista de ministérios ativos
- Membros por ministério
- Líderes responsáveis', 'ministerios', 11, null),

('Departamentos', '# Módulo de Departamentos

Estrutura organizacional da igreja.

## Cadastro de Departamento
1. Acesse Departamentos → Novo Departamento
2. Informe nome do departamento
3. Selecione líder responsável
4. Salve o cadastro

## Liderança
- Cada departamento tem um líder
- Líder deve ser membro cadastrado
- Responsável pela coordenação

## Estrutura Organizacional
- Departamentos organizam a estrutura da igreja
- Diferentes de ministérios (foco administrativo)
- Hierarquia organizacional

## Exemplos de Departamentos
- Administração
- Financeiro
- Recursos Humanos
- Patrimônio
- Comunicação
- Eventos', 'departamentos', 12, null),

('Fornecedores', '# Módulo de Fornecedores

Gestão do cadastro de fornecedores.

## Cadastro de Fornecedor
1. Acesse Fornecedores → Novo Fornecedor
2. Preencha dados básicos:
   - Nome/Razão social
   - Documento (CNPJ/CPF)
3. Dados de contato:
   - Telefone
   - Email
   - Endereço
4. Especifique serviços oferecidos
5. Salve o cadastro

## Documentação
- CNPJ para pessoas jurídicas
- CPF para pessoas físicas
- Validação automática quando possível

## Serviços
- Descrição dos serviços/produtos oferecidos
- Usado para busca e classificação
- Facilita seleção em contas a pagar

## Histórico de Pagamentos
- Integração com contas a pagar
- Relatório de pagamentos por fornecedor
- Análise de gastos por período

## Status
- Ativo/Inativo
- Apenas fornecedores ativos aparecem em seleções

## Relatórios
- Listagem completa
- Gastos por fornecedor
- Histórico de relacionamento', 'fornecedores', 13, null),

('Gestão de Usuários', '# Gestão de Usuários e Perfis de Acesso

Sistema completo de controle de acesso e permissões.

## Processo de Cadastro
1. **Registro**: Usuário se registra no sistema
2. **Análise**: Fica com status "em_analise"
3. **Aprovação**: Admin aprova e define perfil
4. **Ativação**: Usuário pode acessar sistema

## Perfis de Acesso Disponíveis

### Admin
- Acesso total ao sistema
- Pode gerenciar usuários
- Aprovar/rejeitar cadastros
- Configurar permissões

### Pastor
- Acesso baseado em congregação
- Pode gerenciar membros da congregação
- Criar conciliações
- Acessar relatórios

### Gerente Financeiro
- Foco em módulos financeiros
- Aprovar contas a pagar
- Gerar relatórios financeiros
- Sem acesso a congregações

### Gerente de Pessoas
- Gestão de membros
- Organização de eventos
- Relatórios de membros

### Membro
- Acesso básico limitado
- Visualização de eventos
- Dados pessoais

### Secretário(a)
- Gestão administrativa
- Apoio em cadastros
- Organização de eventos

### Tesoureiro(a)
- Foco financeiro específico
- Contas a pagar
- Relatórios financeiros

### Líder de Ministério
- Gestão do ministério específico
- Membros do ministério
- Eventos do ministério

### Operador Financeiro
- Operações financeiras básicas
- Registro de transações
- Relatórios específicos

## Como Aprovar um Usuário
1. Acesse Gestão de Acessos
2. Vá em "Aprovações Pendentes"
3. Visualize dados do usuário
4. Selecione perfil de acesso apropriado
5. Defina congregação (se aplicável)
6. Atribua ministérios (se necessário)
7. Clique em "Aprovar"

## Como Rejeitar um Usuário
1. Acesse usuário pendente
2. Clique em "Rejeitar"
3. Informe motivo da rejeição
4. Confirme a ação

## Permissões por Módulo
Cada perfil tem permissões específicas:
- **View**: Visualizar dados
- **Insert**: Criar novos registros
- **Edit**: Modificar registros
- **Delete**: Excluir registros
- **Approve**: Aprovar processos
- **Export**: Exportar relatórios', null, 14, null),

('Processos Críticos', '# Processos Críticos do Sistema

Documentação dos principais fluxos operacionais.

## Fluxo de Aprovação Financeira

### Contas a Pagar
1. **Solicitação** (Usuário):
   - Cria conta a pagar
   - Anexa comprovantes
   - Status: "Pendente de Aprovação"

2. **Aprovação Gerencial** (Gerente):
   - Revisa solicitação
   - Aprova ou rejeita
   - Status: "Aprovada" ou "Rejeitada"

3. **Autorização** (Admin):
   - Autoriza pagamento
   - Status: "Autorizada"

4. **Pagamento** (Tesouraria):
   - Marca como paga
   - Status: "Paga"

### Conciliações Mensais
1. **Criação** (Pastor/Congregação):
   - Cria conciliação do mês
   - Informa valores por método
   - Status: "Pendente"

2. **Aprovação** (Admin):
   - Revisa valores
   - Aprova ou rejeita
   - Status: "Aprovada" ou "Rejeitada"

## Processo de Conciliação Mensal

### Responsabilidades
- **Congregação**: Coletar e organizar dados
- **Pastor**: Criar e submeter conciliação
- **Administração**: Aprovar e validar

### Passo a Passo
1. **Coleta de Dados** (Durante o mês):
   - Registrar todas as receitas
   - Separar por método de pagamento
   - Organizar comprovantes

2. **Criação da Conciliação** (Fim do mês):
   - Acessar módulo Conciliações
   - Criar nova conciliação
   - Informar valores por método:
     - Dinheiro
     - PIX
     - PIX Online
     - Débito
     - Crédito

3. **Validação Automática**:
   - Sistema calcula total
   - Define valor a enviar (15%)
   - Valida consistência

4. **Submissão**:
   - Enviar para aprovação
   - Aguardar análise administrativa

5. **Aprovação/Rejeição**:
   - Admin revisa valores
   - Aprova ou rejeita com motivo
   - Processo finalizado

## Gestão de Backup e Segurança

### Backup Automático
- Supabase realiza backup automático
- Dados replicados em múltiplas regiões
- Histórico de 7 dias

### Segurança de Dados
- Criptografia em trânsito e repouso
- Autenticação obrigatória
- Políticas RLS (Row Level Security)
- Auditoria de acessos

### Controle de Acesso
- Permissões granulares por módulo
- Princípio do menor privilégio
- Revisão periódica de acessos

## Monitoramento e Alertas

### Indicadores de Performance
- Tempo de resposta das páginas
- Uso de recursos do sistema
- Quantidade de usuários simultâneos

### Alertas Automáticos
- Falhas de sistema
- Tentativas de acesso não autorizado
- Backup mal sucedido

### Logs de Auditoria
- Todas as ações são registradas
- Histórico de alterações
- Controle de downloads de anexos', null, 15, null),

('Troubleshooting', '# Troubleshooting - Resolução de Problemas

Guia para resolução dos problemas mais comuns.

## Problemas de Login e Acesso

### Não consigo fazer login
**Possíveis causas:**
- Email/senha incorretos
- Conta não aprovada
- Conta desativada

**Soluções:**
1. Verificar credenciais
2. Resetar senha se necessário
3. Contatar administrador para verificar status da conta

### Erro de permissão ao acessar módulos
**Causa:** Perfil de acesso não tem permissão
**Solução:** Solicitar ao administrador a revisão das permissões

### Página não carrega após login
**Possíveis causas:**
- Problemas de conexão
- Cache do navegador
- Erro temporário do sistema

**Soluções:**
1. Atualizar a página (F5)
2. Limpar cache do navegador
3. Tentar em modo anônimo/privado
4. Aguardar alguns minutos e tentar novamente

## Problemas com Upload de Arquivos

### Upload de foto de perfil falha
**Possíveis causas:**
- Arquivo muito grande (>2MB)
- Formato não suportado (não JPG/PNG)
- Problemas de conectividade

**Soluções:**
1. Reduzir tamanho da imagem
2. Converter para JPG ou PNG
3. Verificar conexão com internet

### Anexo em conta a pagar não carrega
**Possíveis causas:**
- Arquivo corrompido
- Formato não aceito
- Limite de tamanho excedido

**Soluções:**
1. Verificar integridade do arquivo
2. Usar formatos aceitos (PDF, JPG, PNG)
3. Reduzir tamanho se necessário

## Erros em Formulários

### Dados não salvam
**Possíveis causas:**
- Campos obrigatórios não preenchidos
- Dados inválidos
- Perda de conexão durante envio

**Soluções:**
1. Verificar mensagens de erro em vermelho
2. Preencher todos os campos obrigatórios
3. Verificar formato dos dados (datas, emails, etc.)
4. Tentar salvar novamente

### Dropdown não carrega opções
**Possíveis causas:**
- Problemas de permissão
- Dados não cadastrados
- Erro de carregamento

**Soluções:**
1. Verificar se existem dados cadastrados (ex: membros, congregações)
2. Atualizar a página
3. Verificar permissões de acesso

## Problemas de Performance

### Sistema lento
**Possíveis causas:**
- Muitos usuários simultâneos
- Conexão lenta
- Consultas complexas

**Soluções:**
1. Verificar velocidade da internet
2. Fechar outras abas/aplicativos
3. Tentar em horários de menor movimento
4. Usar filtros para reduzir dados carregados

### Relatórios demoram para gerar
**Causa:** Grande volume de dados
**Soluções:**
1. Usar filtros de data mais restritivos
2. Filtrar por congregação específica
3. Gerar relatórios em horários de menor uso

## Problemas Específicos por Módulo

### Financeiro
- **Erro ao calcular totais**: Verificar se valores estão em formato numérico correto
- **Método de pagamento não aparece**: Verificar cadastro de métodos no sistema

### Membros
- **Foto não aparece**: Verificar se upload foi concluído com sucesso
- **Ministério não salva**: Verificar se ministério está ativo

### Eventos
- **Data não aceita**: Usar formato DD/MM/AAAA
- **Limite de participantes não funciona**: Verificar se número é positivo

### Contas a Pagar
- **Status não muda**: Verificar permissões de aprovação
- **Anexo não baixa**: Verificar se arquivo ainda existe no sistema

## Contato para Suporte

### Quando Contatar
- Erro persiste após seguir soluções
- Dados importantes perdidos
- Funcionalidade crítica não funciona

### Informações para Fornecer
1. Descrição detalhada do problema
2. Passos realizados antes do erro
3. Mensagens de erro exatas
4. Navegador e versão utilizada
5. Screenshots se possível

### Canais de Suporte
- Email do administrador do sistema
- Grupo WhatsApp da equipe técnica
- Telefone para emergências

## Prevenção de Problemas

### Boas Práticas
1. **Backup regular** dos dados importantes
2. **Usar navegadores atualizados**
3. **Manter dados consistentes** entre módulos
4. **Revisar permissões** periodicamente
5. **Treinar usuários** nas funcionalidades

### Manutenção Preventiva
- Limpeza periódica de dados antigos
- Verificação de integridade dos backups
- Atualização de permissões conforme mudanças organizacionais
- Monitoramento de performance do sistema', null, 16, null);
