-- Continuar com as seções restantes de documentação: Regras de Negócio e seções de apoio

-- 6. Regras de Negócio Críticas
INSERT INTO public.documentation_sections (title, content, module_key, section_order) VALUES
('Sistema de Permissões Granulares', '# Sistema de Permissões Granulares

## Visão Geral
O sistema utiliza um modelo de permissões baseado em perfis de acesso com controle granular por módulo e ação específica.

## Estrutura do Sistema

### Perfis de Acesso Disponíveis

#### 1. Super Admin
**Acesso Total ao Sistema**
- Pode criar/editar/deletar perfis de acesso
- Gerencia configurações críticas do sistema
- Acesso irrestrito a todos os módulos
- Pode executar operações de sistema sensíveis

**Permissões Específicas:**
- Dashboard: Todas as ações
- Financeiro: view, insert, edit, delete, approve, export
- Contas a Pagar: view, insert, edit, delete, approve, export
- Membros: view, insert, edit, delete, export
- Eventos: view, insert, edit, delete, export
- Conciliações: view, insert, edit, delete, approve, export
- Congregações: view, insert, edit, delete, export
- Ministérios: view, insert, edit, delete, export
- Departamentos: view, insert, edit, delete, export
- Fornecedores: view, insert, edit, delete, export
- Relatórios: view, export
- Notificações: view, insert, edit, delete
- Configurações: view, edit
- Gestão de Acessos: view, insert, edit, delete

#### 2. Admin
**Gerenciamento Geral**
- Aprovação de usuários
- Acesso a relatórios gerenciais
- Configurações não-críticas
- Gestão operacional

**Permissões Específicas:**
- Dashboard: view
- Financeiro: view, export
- Contas a Pagar: view, approve, export
- Membros: view, insert, edit, export
- Eventos: view, insert, edit, delete, export
- Conciliações: view, approve, export
- Congregações: view, insert, edit, export
- Ministérios: view, insert, edit, export
- Departamentos: view, insert, edit, export
- Fornecedores: view, insert, edit, export
- Relatórios: view, export
- Notificações: view, insert, edit, delete
- Gestão de Acessos: view, insert, edit

#### 3. Pastor
**Gestão da Congregação**
- Acesso baseado em congregação específica
- Gestão de membros de sua congregação
- Aprovação de conciliações de sua área
- Relatórios de sua congregação

**Permissões Específicas:**
- Dashboard: view (dados da congregação)
- Financeiro: view (congregação)
- Contas a Pagar: view (congregação)
- Membros: view, insert, edit (congregação)
- Eventos: view, insert, edit (congregação)
- Conciliações: view, insert, approve (congregação)
- Ministérios: view, insert, edit (congregação)
- Relatórios: view (congregação)

#### 4. Gerente Financeiro
**Foco em Módulos Financeiros**
- Contas a pagar completo
- Relatórios financeiros
- Aprovação de transações
- Gestão de fornecedores

**Permissões Específicas:**
- Dashboard: view (dados financeiros)
- Financeiro: view, insert, edit, approve, export
- Contas a Pagar: view, insert, edit, approve, export
- Fornecedores: view, insert, edit, export
- Conciliações: view, approve, export
- Relatórios: view, export (financeiros)

#### 5. Analista
**Análise e Relatórios**
- Acesso de leitura aos módulos principais
- Foco em análise e geração de relatórios
- Sem permissões de alteração críticas

**Permissões Específicas:**
- Dashboard: view
- Financeiro: view
- Contas a Pagar: view
- Membros: view
- Eventos: view
- Conciliações: view
- Congregações: view
- Ministérios: view
- Fornecedores: view
- Relatórios: view, export

#### 6. Assistente/Obreiro
**Acesso Limitado e Específico**
- Visualização de informações básicas
- Inserção limitada em módulos específicos
- Sem permissões administrativas

**Permissões Específicas:**
- Dashboard: view (limitado)
- Contas a Pagar: insert (limitado)
- Membros: view (limitado)
- Eventos: view

#### 7. Membro
**Perfil Padrão**
- Acesso mínimo ao sistema
- Apenas visualização de informações públicas
- Aguarda aprovação para outros perfis

**Permissões Específicas:**
- Dashboard: view (muito limitado)

## Controle de Acesso por RLS

### Row Level Security (RLS)
Cada tabela utiliza políticas RLS que verificam:
1. Perfil do usuário autenticado
2. Permissões específicas do perfil
3. Contexto da congregação (quando aplicável)
4. Propriedade dos dados (para operações próprias)

### Verificação de Permissões
```sql
-- Função principal de verificação
user_has_permission(módulo, ação)

-- Exemplos de uso
user_has_permission(''financeiro'', ''view'')
user_has_permission(''contas-pagar'', ''approve'')
user_has_permission(''membros'', ''edit'')
```

### Validações Automáticas
- Login: Verificação de status de aprovação
- Navegação: Controle de acesso a rotas
- Operações: Validação antes de cada ação
- Dados: Filtragem automática por contexto

## Segregação de Funções

### Princípios Aplicados
1. **Separação de Responsabilidades**: Nenhum usuário concentra poderes críticos
2. **Dupla Aprovação**: Transações financeiras requerem múltiplas aprovações
3. **Auditoria Completa**: Todas as ações são registradas
4. **Acesso Baseado em Necessidade**: Usuários acessam apenas o necessário

### Controles Implementados
- Aprovação de contas a pagar (2 etapas)
- Conciliação mensal com aprovação
- Gestão de usuários segregada
- Relatórios com controle de exportação

## Casos Especiais

### Acesso a Congregações
- **Pastores**: Apenas sua congregação
- **Admins**: Todas as congregações
- **Financeiro**: Sem acesso direto (via relatórios)
- **Analistas**: Visualização de todas

### Aprovações Hierárquicas
- **Contas a Pagar**: Gerente → Diretor
- **Usuários**: Admin → Super Admin (opcional)
- **Conciliações**: Pastor → Admin/Financeiro
- **Configurações**: Admin → Super Admin

### Exceções e Override
- Super Admin pode fazer override em emergências
- Log de auditoria registra todas as exceções
- Justificativa obrigatória para overrides
- Revisão posterior de ações excepcionais

## Monitoramento e Auditoria

### Logs de Acesso
- Tentativas de login
- Acessos negados
- Operações realizadas
- Mudanças de permissão

### Alertas de Segurança
- Múltiplas tentativas de acesso
- Acessos fora do horário
- Operações suspeitas
- Mudanças críticas de configuração

### Relatórios de Segurança
- Atividade por usuário
- Operações por módulo
- Falhas de segurança
- Tendências de uso', 'sistema', 116),

('Fluxo de Contas a Pagar', '# Fluxo de Contas a Pagar

## Visão Geral do Processo
O sistema de Contas a Pagar possui um fluxo estruturado em 4 etapas principais, garantindo controle e segregação de funções.

## Etapa 1: Criação da Solicitação

### Quem Pode Criar
- Usuários com permissão `contas-pagar.insert`
- Assistentes, Gerentes, Diretores, Administradores

### Dados Obrigatórios
- **Descrição**: Mínimo 10 caracteres
- **Valor**: Maior que zero
- **Data de Vencimento**: Não pode ser passada
- **Congregação**: Local de origem da despesa
- **Categoria**: Classificação da despesa
- **Beneficiário**: Quem receberá o pagamento
- **Método de Pagamento**: PIX, transferência, boleto

### Validações Automáticas
- Valor mínimo: R$ 0,01
- Data de vencimento: Futuro ou hoje
- Anexo obrigatório para valores > R$ 500,00
- Descrição clara e detalhada
- Dados bancários completos (se transferência)

### Status Inicial
- **Status**: "Pendente de Aprovação"
- **Solicitante**: ID do usuário criador
- **Data de Criação**: Timestamp automático

## Etapa 2: Aprovação Gerencial

### Responsáveis
- Gerentes Financeiros
- Administradores
- Usuários com permissão `contas-pagar.approve`

### Análises Realizadas
1. **Adequação Orçamentária**: Verificar se há verba
2. **Documentação**: Validar anexos e informações
3. **Necessidade**: Confirmar relevância da despesa
4. **Valores**: Verificar coerência dos montantes

### Ações Possíveis
- **Aprovar**: Move para "Autorizar Contas"
- **Rejeitar**: Retorna para solicitante com motivo
- **Solicitar Informações**: Pedido de esclarecimentos

### Notificações
- Aprovação: Email para próxima etapa
- Rejeição: Email para solicitante com motivo
- Informações: Email para solicitante

## Etapa 3: Autorização Final

### Responsáveis
- Diretores Financeiros
- Administradores Senior
- Usuários com permissão `contas-pagar.authorize`

### Controles Adicionais
- **Dupla Verificação**: Revisão da aprovação anterior
- **Limite de Valor**: Verificação de alçada
- **Disponibilidade**: Confirmação de caixa
- **Cronograma**: Verificação de fluxo de pagamentos

### Ações Disponíveis
- **Autorizar**: Libera para pagamento
- **Devolver**: Retorna para aprovação com observações
- **Rejeitar**: Cancela definitivamente
- **Agendar**: Define data específica para pagamento

### Agendamento
- **Imediato**: Pagamento hoje
- **Data Específica**: Conforme necessidade
- **Recorrente**: Para despesas mensais
- **Lote**: Agrupamento de pagamentos

## Etapa 4: Execução do Pagamento

### Responsáveis
- Tesoureiros
- Gerentes Financeiros
- Operadores de Pagamento

### Tipos de Pagamento

#### PIX
- **Processamento**: Imediato
- **Confirmação**: Automática
- **Comprovante**: Gerado pelo sistema
- **Reconciliação**: Automática com extrato

#### Transferência Bancária
- **Processamento**: 1-2 dias úteis
- **Confirmação**: Manual ou automática
- **Comprovante**: Upload obrigatório
- **Reconciliação**: Manual com extrato

#### Boleto
- **Geração**: Automática
- **Vencimento**: Conforme agendado
- **Pagamento**: Via internet banking
- **Confirmação**: Por arquivo de retorno

### Controles de Segurança
- **Dupla Assinatura**: Para valores altos
- **Segregação**: Quem autoriza não executa
- **Auditoria**: Log completo de ações
- **Limites**: Por usuário e por dia

## Aprovações em Lote

### Quando Utilizar
- Pagamentos recorrentes (aluguel, utilities)
- Fornecedores pré-aprovados
- Valores dentro de limite pré-estabelecido
- Categorias específicas

### Controles Especiais
- Limite total do lote
- Validação individual mantida
- Aprovação especial para lotes grandes
- Auditoria detalhada

## Estados e Transições

### Fluxo Normal
```
Criada → Pendente Aprovação → Aprovada → Autorizada → Agendada → Paga
```

### Fluxos Alternativos
```
Criada → Pendente Aprovação → Rejeitada (fim)
Aprovada → Devolvida → Pendente Aprovação
Autorizada → Cancelada (excepcional)
```

### Regras de Transição
- Apenas criador pode editar conta pendente
- Aprovador não pode ser o solicitante
- Autorizador não pode ser o aprovador
- Pagador não pode ser o autorizador

## Prazos e SLAs

### Tempos Esperados
- **Aprovação**: 2 dias úteis
- **Autorização**: 1 dia útil
- **Pagamento**: Conforme tipo (PIX: imediato, transferência: 2 dias)

### Alertas Automáticos
- Conta próxima do vencimento
- Atraso na aprovação
- Problema no pagamento
- Confirmação pendente

### Escalation
- Supervisor após 3 dias
- Diretor após 5 dias
- Presidente após 7 dias

## Relatórios e Controles

### KPIs Monitorados
- Tempo médio de aprovação
- Taxa de rejeição por motivo
- Volume de pagamentos por período
- Aderência aos prazos

### Relatórios Gerenciais
- Fluxo de caixa projetado
- Contas por vencer
- Performance dos aprovadores
- Análise de fornecedores

### Auditoria e Compliance
- Trilha completa de aprovações
- Documentação anexa
- Justificativas de rejeição
- Log de todas as operações', 'sistema', 117),

('Processo de Conciliação Mensal', '# Processo de Conciliação Mensal

## Objetivo
Garantir que todas as congregações prestem contas mensalmente dos recursos arrecadados e repassem 15% para a sede, mantendo transparência e controle financeiro.

## Calendário e Prazos

### Cronograma Mensal
- **Dia 1-25**: Período de arrecadação nas congregações
- **Dia 26-30**: Preparação da conciliação
- **Dia 1-5 (mês seguinte)**: Envio obrigatório das conciliações
- **Dia 6-10**: Análise e aprovação pela sede
- **Dia 11-15**: Correções e reenvios (se necessário)

### Alertas Automáticos
- **Dia 28**: Lembrete para preparar conciliação
- **Dia 3**: Aviso de prazo para envio
- **Dia 6**: Alerta de atraso para congregações pendentes
- **Dia 10**: Escalation para supervisores

## Dados da Conciliação

### Informações Obrigatórias
- **Período**: Mês/ano de referência
- **Congregação**: Identificação da unidade
- **Total de Receitas**: Soma de todas as entradas
- **Métodos de Pagamento**: Distribuição por tipo
- **Data da Conciliação**: Quando foi fechada
- **Responsável**: Pastor ou tesoureiro

### Detalhamento por Método
- **PIX Presencial**: Valores recebidos via PIX durante cultos
- **PIX Online**: Transferências via QR Code ou chave
- **Cartão de Débito**: Pagamentos com cartão
- **Cartão de Crédito**: Pagamentos parcelados ou à vista
- **Dinheiro**: Valores em espécie

### Cálculos Automáticos
- **Total de Receitas**: Soma de todos os métodos
- **Valor de Repasse (15%)**: Calculado automaticamente
- **Valor para Congregação (85%)**: Saldo remanescente
- **Validações**: Verificação de consistência

## Processo de Envio

### Preparação pela Congregação
1. **Coleta de Dados**: Reunir informações de todo o mês
2. **Validação Interna**: Conferir valores e cálculos
3. **Documentação**: Organizar comprovantes
4. **Preenchimento**: Inserir dados no sistema

### Validações do Sistema
- **Coerência**: Valores devem ser positivos
- **Completude**: Todos os campos obrigatórios
- **Histórico**: Comparação com meses anteriores
- **Limites**: Verificação de variações extremas

### Submissão
- **Status Inicial**: "Pendente de Aprovação"
- **Notificação**: Email automático para sede
- **Protocolo**: Número de identificação único
- **Timestamp**: Registro de data/hora de envio

## Análise e Aprovação

### Responsáveis pela Análise
- **Primeira Análise**: Gerente Financeiro
- **Aprovação Final**: Diretor ou Admin
- **Casos Especiais**: Presidente (variações > 30%)

### Critérios de Análise
1. **Consistência dos Dados**
   - Valores coerentes com histórico
   - Distribuição por métodos realista
   - Ausência de erros matemáticos

2. **Comparação Histórica**
   - Variação em relação ao mês anterior
   - Tendência nos últimos 6 meses
   - Sazonalidade esperada

3. **Validação Documental**
   - Comprovantes anexados
   - Assinatura do responsável
   - Carimbo da congregação

### Ações Possíveis
- **Aprovar**: Aceitar conciliação como enviada
- **Solicitar Esclarecimentos**: Pedir informações adicionais
- **Rejeitar**: Devolver para correção
- **Aprovar com Ressalvas**: Aceitar com observações

## Tratamento de Problemas

### Problemas Comuns
1. **Valores Inconsistentes**
   - Diferenças matemáticas
   - Métodos não conferem com total
   - Valores irrealisticamente altos/baixos

2. **Documentação Incompleta**
   - Falta de comprovantes
   - Assinaturas ausentes
   - Informações em branco

3. **Atrasos no Envio**
   - Congregação não enviou no prazo
   - Sistema indisponível
   - Problemas técnicos

### Processo de Correção
1. **Identificação**: Sistema detecta ou analista identifica
2. **Notificação**: Email com detalhes do problema
3. **Prazo**: 3 dias úteis para correção
4. **Reenvio**: Nova submissão com correções
5. **Reanálise**: Processo normal de aprovação

### Escalation
- **Nível 1**: Contato direto com congregação
- **Nível 2**: Comunicação com supervisor regional
- **Nível 3**: Intervenção da diretoria
- **Nível 4**: Medidas administrativas

## Repasse Financeiro

### Cálculo do Repasse
- **Base**: Total de receitas declarado
- **Percentual**: 15% fixo
- **Mínimo**: Não há valor mínimo
- **Máximo**: Sem limite

### Modalidades de Repasse
1. **PIX**: Transferência imediata
2. **TED**: Transferência programada
3. **Depósito**: Em conta específica
4. **Compensação**: Desconto em despesas

### Prazos de Repasse
- **Após Aprovação**: 5 dias úteis
- **PIX**: Mesmo dia da aprovação
- **TED**: 1 dia útil
- **Depósito**: 2-3 dias úteis

### Comprovação
- **Comprovante**: Gerado automaticamente
- **Notificação**: Email para congregação
- **Registro**: Log no sistema
- **Conciliação**: Verificação mensal

## Monitoramento e Controle

### Indicadores Principais
- **Taxa de Pontualidade**: % de envios no prazo
- **Taxa de Aprovação**: % de conciliações aprovadas na primeira análise
- **Tempo Médio de Processamento**: Dias entre envio e aprovação
- **Volume de Receitas**: Total arrecadado por congregação

### Relatórios Gerenciais
- **Dashboard Executivo**: Visão geral do mês
- **Relatório de Pendências**: Congregações em atraso
- **Análise de Tendências**: Crescimento/declínio por unidade
- **Ranking de Performance**: Melhores práticas

### Alertas e Notificações
- **Congregações em Atraso**: Diário
- **Variações Significativas**: Imediato
- **Problemas Recorrentes**: Semanal
- **Resumo Executivo**: Mensal

## Auditoria e Compliance

### Controles Internos
- **Segregação de Funções**: Quem prepara não aprova
- **Dupla Verificação**: Análise por duas pessoas
- **Trilha de Auditoria**: Log completo de ações
- **Backup de Dados**: Cópia de segurança diária

### Documentação
- **Arquivo Digital**: Todos os documentos digitalizados
- **Retenção**: 7 anos de histórico
- **Acesso Controlado**: Apenas pessoal autorizado
- **Versionamento**: Controle de alterações

### Auditoria Externa
- **Acesso aos Dados**: Relatórios específicos
- **Documentação Suporte**: Comprovantes organizados
- **Explicações**: Responsáveis disponíveis
- **Melhorias**: Implementação de sugestões', 'sistema', 118);