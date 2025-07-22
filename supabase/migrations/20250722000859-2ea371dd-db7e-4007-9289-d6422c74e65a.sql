-- Continuar com documentação dos Submódulos de Relatórios e Regras de Negócio

-- 5. Submódulos de Relatórios
INSERT INTO public.documentation_sections (title, content, module_key, section_order) VALUES
('Relatórios Financeiros', '# Relatórios Financeiros

## Propósito
Fornece análises detalhadas e visualizações dos dados financeiros da organização, permitindo tomadas de decisão baseadas em dados.

## Tipos de Relatórios

### 1. Receitas e Despesas por Congregação
- **Objetivo**: Análise comparativa entre congregações
- **Dados**: Entrada de recursos, gastos por categoria, saldo líquido
- **Período**: Mensal, trimestral, anual
- **Filtros**: Congregação específica, categoria, período

### 2. Pagamentos a Fornecedores
- **Objetivo**: Controle de gastos com fornecedores
- **Dados**: Total pago por fornecedor, categorias, frequência
- **Análises**: Ranking de fornecedores, tendências de gasto
- **Exportação**: PDF, Excel, dados contábeis

### 3. Submissões de Conciliações
- **Objetivo**: Acompanhar processo de conciliação mensal
- **Dados**: Status por congregação, prazos, aprovações
- **Indicadores**: Taxa de aprovação, tempo médio, pendências
- **Alertas**: Congregações em atraso, problemas recorrentes

## Filtros Avançados
- **Período**: Data inicial e final personalizáveis
- **Congregação**: Uma ou múltiplas congregações
- **Categoria**: Tipos específicos de transação
- **Status**: Pendente, aprovado, pago
- **Valor**: Faixas de valores
- **Responsável**: Por usuário ou perfil

## Visualizações Disponíveis

### Gráficos
- Barras comparativas por congregação
- Linhas de tendência temporal
- Pizza por categorias
- Mapas de calor por período

### Tabelas
- Dados detalhados linha por linha
- Subtotais por agrupamento
- Percentuais de participação
- Variações percentuais

## Exportação
- **PDF**: Relatórios formatados para apresentação
- **Excel**: Dados brutos para análise
- **CSV**: Importação em outros sistemas
- **Imagem**: Gráficos para apresentações

## Agendamento
- Relatórios automáticos mensais
- Envio por email para gestores
- Alertas de variações significativas
- Dashboards em tempo real

## Permissões
- **Visualizar**: Gestores financeiros, admins, pastores
- **Exportar**: Perfis específicos
- **Configurar**: Apenas administradores
- **Agendar**: Gestores seniores', 'relatorios', 111),

('Relatórios de Membros', '# Relatórios de Membros

## Propósito
Análise estatística e demográfica dos membros da organização para planejamento estratégico e acompanhamento de crescimento.

## Relatórios Disponíveis

### 1. Cadastro por Período
- Novos membros por mês/ano
- Taxa de crescimento
- Análise de tendências
- Comparação entre congregações

### 2. Demografia
- Faixa etária dos membros
- Distribuição geográfica
- Níveis educacionais
- Profissões mais comuns

### 3. Participação em Ministérios
- Membros por ministério
- Líderes ativos
- Participação múltipla
- Ministérios com carência

### 4. Análise de Batismos
- Batismos por período
- Idade média dos batizandos
- Crescimento espiritual
- Congregação de origem

## Métricas Principais

### Crescimento
- Total de membros ativos
- Taxa de crescimento mensal
- Retenção de membros
- Novos convertidos

### Engajamento
- Participação em ministérios
- Frequência em eventos
- Contribuições regulares
- Atividades da congregação

### Demografia
- Distribuição por idade
- Gênero
- Estado civil
- Situação educacional

## Análises Especiais

### Mapeamento Geográfico
- Distribuição por bairros
- Distância da congregação
- Potencial para novas unidades
- Análise de transporte

### Perfil Ministerial
- Dons espirituais identificados
- Liderança em potencial
- Necessidades de treinamento
- Sucessão de lideranças

## Filtros e Segmentação
- Por congregação
- Por ministério
- Por faixa etária
- Por data de entrada
- Por status de batismo
- Por participação em atividades

## Relatórios Executivos
- Resumo mensal para liderança
- Dashboard de indicadores-chave
- Alertas de variações
- Tendências de longo prazo

## Privacidade e Conformidade
- Dados anonimizados quando possível
- Acesso restrito por permissão
- Log de acessos aos relatórios
- Conformidade com LGPD', 'relatorios', 112),

('Relatórios de Eventos', '# Relatórios de Eventos

## Propósito
Análise de participação, engajamento e efetividade dos eventos realizados pela organização.

## Tipos de Análise

### 1. Participação por Evento
- Número de participantes
- Taxa de comparecimento
- Perfil dos participantes
- Feedback coletado

### 2. Análise Temporal
- Eventos por mês/trimestre
- Sazonalidade de participação
- Horários de maior engajamento
- Tendências anuais

### 3. Performance por Tipo
- Cultos regulares
- Eventos especiais
- Conferências
- Atividades sociais

### 4. Análise por Organizador
- Eventos por líder
- Taxa de sucesso
- Recursos utilizados
- Capacidade de mobilização

## Métricas de Sucesso

### Participação
- Número absoluto de participantes
- Percentual da congregação
- Novos visitantes
- Participantes recorrentes

### Engajamento
- Duração média de participação
- Interação durante evento
- Feedback positivo
- Solicitações de repetição

### Recursos
- Custo por participante
- ROI de investimento
- Recursos humanos necessários
- Infraestrutura utilizada

## Análises Específicas

### Eventos Evangelísticos
- Número de decisões
- Follow-up realizado
- Conversões confirmadas
- Integração na congregação

### Eventos de Ensino
- Conhecimento absorvido
- Aplicação prática
- Multiplicação do ensino
- Impacto na comunidade

### Eventos Sociais
- Fortalecimento de vínculos
- Integração de novos membros
- Satisfação geral
- Repetição de presença

## Comparações e Benchmarks
- Entre congregações
- Com períodos anteriores
- Por tipo de evento
- Por faixa etária dos participantes

## Insights para Planejamento
- Melhor dia da semana
- Horário ideal
- Duração otimizada
- Local mais adequado
- Recursos necessários

## Relatórios Automáticos
- Pós-evento imediato
- Consolidado mensal
- Análise trimestral
- Planejamento anual', 'relatorios', 113),

('Relatórios de Fornecedores', '# Relatórios de Fornecedores

## Propósito
Análise de relacionamento comercial, performance e custos com fornecedores para otimização de processos e negociações.

## Análises Principais

### 1. Volume de Transações
- Total de pagamentos por fornecedor
- Frequência de contratação
- Valor médio por transação
- Crescimento do relacionamento

### 2. Performance de Entrega
- Pontualidade nas entregas
- Qualidade dos serviços
- Conformidade com especificações
- Resolução de problemas

### 3. Análise de Custos
- Comparação de preços
- Evolução de custos
- Negociações realizadas
- Economia obtida

### 4. Categorização
- Fornecedores por tipo de serviço
- Fornecedores estratégicos
- Fornecedores eventuais
- Fornecedores problemáticos

## Métricas de Avaliação

### Financeiras
- Total gasto por fornecedor
- Percentual do orçamento
- Variação de preços
- Condições de pagamento

### Qualitativas
- Índice de satisfação
- Número de reclamações
- Tempo de resolução
- Recomendações internas

### Operacionais
- Tempo de resposta
- Flexibilidade de atendimento
- Capacidade de crescimento
- Inovação oferecida

## Análises Comparativas

### Benchmarking
- Comparação entre fornecedores similares
- Melhores práticas identificadas
- Oportunidades de melhoria
- Padrões de mercado

### Histórico
- Evolução do relacionamento
- Melhorias implementadas
- Problemas resolvidos
- Tendências futuras

## Relatórios de Negociação
- Poder de barganha
- Dependência mútua
- Oportunidades de parceria
- Riscos identificados

## Gestão de Riscos
- Fornecedores únicos
- Dependência crítica
- Problemas financeiros
- Questões de compliance

## Relatórios para Tomada de Decisão
- Ranking de fornecedores
- Recomendações de contratação
- Fornecedores a descontinuar
- Oportunidades de parceria

## Auditoria e Compliance
- Documentação completa
- Conformidade fiscal
- Certificações válidas
- Histórico de pagamentos', 'relatorios', 114),

('Relatórios de Conciliações', '# Relatórios de Conciliações

## Propósito
Monitoramento e análise do processo mensal de conciliação financeira de todas as congregações.

## Visão Geral do Processo

### Status das Conciliações
- Congregações que enviaram
- Congregações pendentes
- Conciliações aprovadas
- Conciliações rejeitadas

### Prazos e Cumprimento
- Data limite mensal
- Congregações em dia
- Atrasos por congregação
- Histórico de pontualidade

## Análises Financeiras

### Valores Conciliados
- Total de receitas por congregação
- Percentual de repasse (15%)
- Valores enviados para sede
- Variações mês a mês

### Métodos de Pagamento
- Distribuição PIX vs outros
- PIX online vs presencial
- Cartão débito/crédito
- Dinheiro em espécie

### Análise de Tendências
- Crescimento/declínio por congregação
- Sazonalidade das receitas
- Padrões de arrecadação
- Projeções futuras

## Controles de Processo

### Tempo de Aprovação
- Tempo médio por conciliação
- Gargalos identificados
- Eficiência por aprovador
- Melhorias de processo

### Taxa de Rejeição
- Percentual de rejeições
- Motivos mais comuns
- Congregações com mais problemas
- Ações corretivas

### Qualidade dos Dados
- Completude das informações
- Consistência dos valores
- Documentação anexa
- Precisão dos cálculos

## Relatórios por Congregação

### Performance Individual
- Histórico de envios
- Pontualidade
- Qualidade dos dados
- Tendências financeiras

### Comparação Entre Congregações
- Ranking por receita
- Eficiência operacional
- Crescimento relativo
- Boas práticas

## Análises Especiais

### Identificação de Padrões
- Congregações sempre pontuais
- Problemas recorrentes
- Melhorias significativas
- Necessidades de treinamento

### Projeções e Planejamento
- Receita esperada mensal
- Planejamento de fluxo de caixa
- Identificação de riscos
- Oportunidades de crescimento

## Alertas e Notificações
- Congregações em atraso
- Valores fora do padrão
- Problemas de qualidade
- Prazos se aproximando

## Dashboards Executivos
- KPIs principais
- Semáforos de status
- Gráficos de tendência
- Resumos executivos

## Exportação e Distribuição
- Relatórios para contabilidade
- Dashboards para liderança
- Dados para auditoria
- Relatórios regulatórios', 'relatorios', 115);