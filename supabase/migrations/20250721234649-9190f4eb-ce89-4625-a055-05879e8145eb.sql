-- Adicionar mais seções de documentação
INSERT INTO public.documentation_sections (title, content, module_key, section_order, parent_section_id) VALUES
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

## Anexos
- Upload obrigatório de comprovantes
- Formatos aceitos: PDF, imagens
- Controle de download com auditoria

## Contas Recorrentes
- Checkbox para marcar como recorrente
- Frequência: Mensal (padrão)
- Sistema pode gerar automaticamente', 'contas-pagar', 6, null),

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

## Filtros Disponíveis
- **Data**: Período específico ou predefinido
- **Congregação**: Filtro por congregação específica
- **Status**: Ativo/inativo, aprovado/pendente
- **Categoria**: Por tipo ou categoria específica

## Exportação
- **PDF**: Para impressão e arquivo
- **Excel**: Para análise de dados
- **Visualização**: Preview antes da exportação

## Como Gerar um Relatório
1. Acesse o módulo Relatórios
2. Selecione o tipo de relatório desejado
3. Configure os filtros necessários
4. Clique em "Gerar Relatório"
5. Visualize o resultado
6. Exporte se necessário', 'relatorios', 7, null);