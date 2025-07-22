
-- Inserir documentação completa para todos os módulos faltantes e regras de negócio

-- 1. Configurações
INSERT INTO public.documentation_sections (title, content, module_key, section_order) VALUES
('Configurações', '# Configurações do Sistema

## Propósito
O módulo de Configurações permite aos administradores gerenciar as configurações globais do sistema, incluindo parâmetros de funcionamento, integrações e preferências organizacionais.

## Funcionalidades Principais
- **Configurações Gerais**: Dados da organização, logo, informações de contato
- **Configurações de Sistema**: Parâmetros técnicos e integrações
- **Configurações de Segurança**: Políticas de senha, timeout de sessão
- **Configurações de Notificação**: Templates de email, configurações SMTP

## Permissões Necessárias
- **Visualizar**: Disponível para Admins e Super Admins
- **Editar**: Restrito a Super Admins
- **Configurações Críticas**: Apenas Super Admins

## Como Utilizar

### Acessando as Configurações
1. Faça login como administrador
2. Navegue até o menu "Configurações" no sidebar
3. Selecione a categoria de configuração desejada

### Alterando Configurações
1. Localize a configuração que deseja alterar
2. Clique no campo para editá-lo
3. Insira o novo valor
4. Clique em "Salvar" para confirmar as alterações

### Backup de Configurações
- O sistema automaticamente mantém histórico das alterações
- Configurações críticas exigem confirmação dupla
- Log de auditoria registra todas as modificações

## Configurações Importantes

### Dados da Organização
- Nome da igreja/organização
- CNPJ e dados fiscais
- Endereço e contato
- Logo e identidade visual

### Integrações
- Configurações de email (SMTP)
- APIs externas
- Sistemas de pagamento
- Backup automático

## Boas Práticas
- Sempre teste configurações em ambiente de desenvolvimento primeiro
- Mantenha backup das configurações antes de alterações críticas
- Documente mudanças importantes
- Revise configurações periodicamente', 'configuracoes', 100),

-- 2. Gestão de Acessos (CRÍTICO)
('Gestão de Acessos', '# Gestão de Acessos

## Propósito
O módulo de Gestão de Acessos é o coração do sistema de segurança, controlando quem pode acessar o sistema, quais permissões cada usuário possui e gerenciando todo o ciclo de vida dos acessos.

## Fluxo Completo de Aprovação de Usuários

### 1. Registro de Novo Usuário
- Usuário se cadastra fornecendo dados básicos
- Sistema cria perfil com status "em_analise"
- Perfil padrão "Membro" é atribuído temporariamente
- Administradores são notificados automaticamente

### 2. Análise e Aprovação
1. **Acesso à Lista de Pendentes**
   - Menu: Gestão de Acessos > Usuários Pendentes
   - Visualizar dados do usuário solicitante
   - Verificar congregação selecionada

2. **Processo de Aprovação**
   - Selecionar perfil de acesso apropriado
   - Definir congregação (se aplicável)
   - Atribuir ministérios (opcional)
   - Confirmar aprovação

3. **Processo de Rejeição**
   - Inserir motivo da rejeição
   - Escolher se permite nova solicitação
   - Confirmar rejeição

### 3. Configuração de Perfis de Acesso
Cada perfil possui permissões específicas:

#### Super Admin
- Acesso total ao sistema
- Pode criar/editar perfis de acesso
- Gerencia configurações críticas
- Acesso a todos os módulos e ações

#### Admin
- Gerenciamento geral do sistema
- Aprovação de usuários
- Acesso a relatórios gerenciais
- Configurações não-críticas

#### Pastor
- Acesso baseado em congregação
- Gestão de membros de sua congregação
- Relatórios de sua área
- Aprovação de conciliações

#### Gerente Financeiro
- Foco em módulos financeiros
- Contas a pagar completo
- Relatórios financeiros
- Aprovação de transações

#### Obreiro/Membro
- Acesso limitado e específico
- Visualização de informações básicas
- Sem permissões administrativas

## Sistema de Permissões Granulares

### Estrutura de Permissões
Cada módulo possui ações específicas:
- **view**: Visualizar dados
- **insert**: Criar novos registros
- **edit**: Editar registros existentes
- **delete**: Excluir registros
- **approve**: Aprovar/rejeitar
- **export**: Exportar dados

### Matriz de Permissões por Módulo

#### Dashboard
- Super Admin: Todas
- Admin: view
- Pastor: view (dados da congregação)
- Financeiro: view (dados financeiros)
- Obreiro: view (limitado)

#### Financeiro
- Super Admin: Todas
- Admin: view, export
- Pastor: view (congregação)
- Financeiro: Todas
- Obreiro: Nenhuma

#### Contas a Pagar
- Super Admin: Todas
- Admin: view, approve, export
- Pastor: view (congregação)
- Financeiro: Todas
- Obreiro: insert (limitado)

## Gestão de Usuários Ativos

### Visualização de Usuários
- Lista todos usuários ativos
- Filtros por congregação, perfil, status
- Busca por nome/email
- Informações de último acesso

### Modificação de Perfis
1. Selecionar usuário na lista
2. Clicar em "Editar Perfil"
3. Alterar perfil de acesso
4. Modificar congregação/ministérios
5. Salvar alterações

### Desativação de Usuários
- Processo reversível
- Mantém histórico de ações
- Remove acesso imediato
- Notificação automática

## Segurança e Auditoria

### Log de Auditoria
Todas as ações são registradas:
- Quem fez a alteração
- Quando foi feita
- Valores anteriores e novos
- IP de origem
- Motivo da alteração

### Políticas de Segurança
- Senhas devem atender critérios mínimos
- Sessões expiram por inatividade
- Tentativas de login são monitoradas
- Acesso baseado em RLS (Row Level Security)

## Casos de Uso Comuns

### Novo Pastor
1. Pastor se cadastra no sistema
2. Admin aprova com perfil "Pastor"
3. Atribui congregação específica
4. Pastor acessa apenas dados de sua congregação

### Novo Funcionário Financeiro
1. Funcionário solicita acesso
2. Admin aprova com perfil "Gerente Financeiro"
3. Acesso a todos módulos financeiros
4. Sem acesso a dados de outras congregações

### Transferência de Pastor
1. Admin modifica congregação do pastor
2. Acesso aos dados da nova congregação
3. Remove acesso à congregação anterior
4. Log registra a transferência

## Troubleshooting

### Usuário Não Consegue Acessar
1. Verificar status de aprovação
2. Confirmar perfil de acesso
3. Validar permissões do módulo
4. Checar log de auditoria

### Permissões Incorretas
1. Revisar perfil de acesso atribuído
2. Verificar configuração do perfil
3. Confirmar hierarquia de permissões
4. Atualizar se necessário', 'gestao-acessos', 101),

-- 3. Submódulos de Contas a Pagar
('Nova Conta a Pagar', '# Nova Conta a Pagar

## Propósito
Interface para criação de novas solicitações de pagamento, iniciando o fluxo de aprovação de contas a pagar.

## Processo Completo

### 1. Preenchimento dos Dados Obrigatórios
- **Descrição**: Detalhamento claro do que será pago
- **Valor**: Quantia a ser paga
- **Data de Vencimento**: Prazo para pagamento
- **Congregação**: Local de origem da despesa
- **Categoria**: Tipo de despesa
- **Beneficiário**: Quem receberá o pagamento

### 2. Dados Complementares
- **Método de Pagamento**: PIX, transferência, boleto
- **Banco/Agência/Conta**: Para transferências
- **Número da Fatura**: Referência documental
- **Anexo**: Comprovante ou nota fiscal
- **Observações**: Informações adicionais

### 3. Configurações Especiais
- **Urgência**: Normal, alta, crítica
- **Recorrência**: Se é pagamento mensal
- **Descrição da Urgência**: Justificativa para urgência

### 4. Submissão
- Revisão dos dados inseridos
- Confirmação da solicitação
- Status inicial: "Pendente de Aprovação"

## Validações do Sistema
- Valor deve ser maior que zero
- Data de vencimento não pode ser passada
- Anexo obrigatório para valores acima de R$ 500
- Descrição deve ter pelo menos 10 caracteres

## Após Submissão
- Email automático para gestores
- Entrada no fluxo de aprovação
- Disponível em "Pendentes de Aprovação"', 'contas-pagar', 102),

('Pendentes de Aprovação', '# Pendentes de Aprovação

## Propósito
Visualização e gestão inicial das contas aguardando primeira aprovação gerencial.

## Funcionalidades

### Visualização
- Lista todas contas com status "Pendente de Aprovação"
- Filtros por congregação, urgência, data
- Ordenação por data de criação ou vencimento
- Indicadores visuais de urgência

### Ações Disponíveis
1. **Visualizar Detalhes**: Ver todos os dados da conta
2. **Baixar Anexo**: Acessar comprovantes
3. **Aprovar para Autorização**: Enviar para próxima etapa
4. **Rejeitar**: Devolver com motivo

### Processo de Aprovação
1. Clicar na conta desejada
2. Revisar dados e anexos
3. Verificar adequação orçamentária
4. Clicar em "Aprovar"
5. Conta move para "Autorizar Contas"

### Processo de Rejeição
1. Selecionar conta a rejeitar
2. Clicar em "Rejeitar"
3. Inserir motivo detalhado
4. Confirmar rejeição
5. Solicitante é notificado automaticamente

## Permissões
- Visualizar: Gerentes Financeiros, Admins
- Aprovar/Rejeitar: Gerentes Financeiros, Admins

## Relatórios
- Tempo médio de aprovação
- Taxa de rejeição por categoria
- Volume por congregação', 'contas-pagar', 103),

('Autorizar Contas', '# Autorizar Contas

## Propósito
Segunda etapa do fluxo de aprovação, onde contas pré-aprovadas recebem autorização final para pagamento.

## Diferença da Etapa Anterior
- **Pendentes**: Primeira análise gerencial
- **Autorizar**: Aprovação final e autorização de pagamento
- Controle duplo de segurança

## Funcionalidades

### Visualização de Contas Aprovadas
- Lista contas com status "Aprovado"
- Histórico de aprovação anterior
- Dados completos da solicitação
- Anexos e documentação

### Processo de Autorização
1. **Análise Final**: Revisar dados e aprovação anterior
2. **Verificação Orçamentária**: Confirmar disponibilidade
3. **Autorização**: Liberar para pagamento
4. **Agendamento**: Definir data de pagamento

### Ações Disponíveis
- **Autorizar**: Libera conta para pagamento
- **Devolver**: Retorna para aprovação com observações
- **Rejeitar**: Cancela definitivamente
- **Agendar**: Define data específica de pagamento

### Autorização em Lote
- Selecionar múltiplas contas
- Autorizar conjunto de pagamentos
- Útil para pagamentos recorrentes
- Validação individual mantida

## Controles de Segurança
- Dupla aprovação obrigatória
- Limite de valor por autorizador
- Log detalhado de ações
- Segregação de funções

## Relatórios de Autorização
- Contas autorizadas por período
- Tempo entre aprovação e autorização
- Volume financeiro autorizado
- Pendências de autorização', 'contas-pagar', 104),

('Contas Aprovadas', '# Contas Aprovadas

## Propósito
Gestão e controle das contas que foram autorizadas e estão prontas para pagamento ou já foram processadas.

## Status das Contas
- **Autorizada**: Pronta para pagamento
- **Agendada**: Com data definida para pagamento
- **Em Processamento**: Pagamento sendo executado
- **Paga**: Pagamento concluído

## Funcionalidades Principais

### Controle de Pagamentos
1. **Agendar Pagamento**: Definir data específica
2. **Processar Pagamento**: Executar transferência
3. **Confirmar Pagamento**: Validar conclusão
4. **Gerar Comprovante**: Documentar pagamento

### Gestão de Agenda
- Calendário de pagamentos
- Alertas de vencimento
- Reagendamento quando necessário
- Controle de fluxo de caixa

### Acompanhamento
- Status em tempo real
- Histórico completo de ações
- Documentação anexa
- Comprovantes de pagamento

## Processo de Pagamento

### 1. Preparação
- Verificar dados bancários
- Validar disponibilidade financeira
- Conferir documentação
- Agendar data de execução

### 2. Execução
- Processar transferência/PIX
- Gerar comprovante
- Atualizar status
- Registrar conclusão

### 3. Confirmação
- Validar recebimento
- Arquivar documentação
- Atualizar registros contábeis
- Notificar solicitante

## Edição de Contas Aprovadas
- Modificar dados bancários
- Atualizar valores (com justificativa)
- Alterar data de pagamento
- Adicionar observações

## Relatórios e Controles
- Fluxo de caixa projetado
- Pagamentos por vencimento
- Controle orçamentário
- Análise de fornecedores', 'contas-pagar', 105),

('Contas Pagas', '# Contas Pagas

## Propósito
Arquivo e controle histórico de todas as contas que foram efetivamente pagas, servindo como base para auditoria e controle financeiro.

## Informações Registradas
- Dados completos da solicitação
- Histórico de aprovações
- Comprovantes de pagamento
- Datas de todas as etapas
- Valores finais pagos

## Funcionalidades

### Consulta Histórica
- Busca por período
- Filtro por fornecedor
- Categorias de despesa
- Congregação de origem
- Valores e métodos de pagamento

### Documentação
- Acesso a todos anexos
- Comprovantes de pagamento
- Notas fiscais originais
- Histórico de comunicações

### Relatórios Financeiros
- Total pago por período
- Análise por categoria
- Gastos por congregação
- Ranking de fornecedores
- Tendências de pagamento

## Controles de Auditoria
- Log completo de ações
- Trilha de aprovações
- Documentação obrigatória
- Timestamps de todas etapas
- Responsáveis por cada ação

## Exportação de Dados
- Relatórios em PDF
- Planilhas Excel
- Dados para contabilidade
- Comprovantes fiscais
- Resumos gerenciais

## Reprocessamento
- Estorno de pagamentos (casos especiais)
- Correção de dados históricos
- Reclassificação de categorias
- Ajustes contábeis

## Integração Contábil
- Lançamentos automáticos
- Códigos de classificação
- Centros de custo
- Conciliação bancária
- Fechamento mensal', 'contas-pagar', 106),

-- 4. Submódulos de Notificações
('Nova Notificação', '# Nova Notificação

## Propósito
Interface para criação e envio de notificações personalizadas para diferentes grupos de usuários através de múltiplos canais.

## Tipos de Mensagem

### 1. Texto Simples
- Mensagem básica de texto
- Formatação limitada
- Ideal para avisos rápidos
- Suporte a emojis

### 2. Mensagem com Vídeo
- Inclui vídeo da biblioteca
- Texto complementar
- Preview do vídeo
- Controles de reprodução

### 3. Mensagem Rica
- Formatação avançada
- Links e imagens
- Call-to-action
- Layout personalizado

## Canais de Entrega

### WhatsApp
- Mensagens diretas
- Grupos específicos
- Integração via API
- Status de entrega

### Email
- Templates personalizados
- Anexos suportados
- HTML responsivo
- Tracking de abertura

### SMS
- Mensagens curtas
- Entrega imediata
- Confirmação de recebimento
- Custos por envio

### Push Notification
- App mobile
- Notificações instantâneas
- Ícones e sons
- Deep linking

## Seleção de Destinatários

### Por Perfil de Acesso
- Todos Administradores
- Pastores específicos
- Gerentes Financeiros
- Membros ativos

### Por Congregação
- Congregação específica
- Múltiplas congregações
- Todas congregações
- Exclusão de congregações

### Por Ministério
- Ministério específico
- Combinação de ministérios
- Líderes de ministério
- Membros ativos

### Lista Personalizada
- Seleção manual
- Import de planilha
- Grupos salvos
- Listas dinâmicas

## Agendamento

### Envio Imediato
- Processa imediatamente
- Confirmação instantânea
- Status em tempo real

### Agendamento Simples
- Data e hora específica
- Fuso horário local
- Validação de data futura

### Agendamento Recorrente
- Diário, semanal, mensal
- Dias específicos da semana
- Datas especiais
- Fim de recorrência

## Processo de Criação

### 1. Configuração Básica
- Tipo de mensagem
- Canal de entrega
- Assunto/título
- Prioridade

### 2. Conteúdo
- Texto da mensagem
- Vídeo (se aplicável)
- Imagens/anexos
- Links externos

### 3. Destinatários
- Critérios de seleção
- Validação da lista
- Prévia dos destinatários
- Exclusões específicas

### 4. Agendamento
- Definir data/hora
- Configurar recorrência
- Validar configurações
- Confirmar criação

### 5. Revisão Final
- Preview da mensagem
- Lista de destinatários
- Configurações de envio
- Custos estimados

## Validações
- Mensagem não pode estar vazia
- Pelo menos um destinatário
- Data de agendamento válida
- Limites de caracteres por canal
- Aprovação para grandes volumes

## Monitoramento
- Status de envio
- Taxa de entrega
- Falhas e reenvios
- Métricas de engajamento', 'notificacoes', 107),

('Mensagens Agendadas', '# Mensagens Agendadas

## Propósito
Controle e gestão de todas as notificações que foram criadas mas ainda não foram enviadas, permitindo edição e cancelamento.

## Visualização de Mensagens

### Lista de Agendamentos
- Todas mensagens pendentes
- Data/hora de envio
- Tipo e canal
- Número de destinatários
- Status atual

### Filtros Disponíveis
- Por data de envio
- Por tipo de mensagem
- Por canal de entrega
- Por criador
- Por status

### Indicadores Visuais
- Cores por prioridade
- Ícones por canal
- Status de processamento
- Alertas de problemas

## Gestão de Mensagens

### Edição de Mensagens
1. **Conteúdo**: Alterar texto e mídia
2. **Destinatários**: Adicionar/remover
3. **Agendamento**: Modificar data/hora
4. **Configurações**: Mudar canal ou tipo

### Cancelamento
- Cancelar envio agendado
- Confirmar cancelamento
- Manter histórico
- Notificar criador

### Duplicação
- Copiar mensagem existente
- Modificar conforme necessário
- Novo agendamento
- Reutilizar listas

## Controles de Segurança

### Permissões de Edição
- Criador pode editar
- Administradores full access
- Limite temporal para edição
- Log de modificações

### Aprovação de Alterações
- Mudanças significativas
- Grandes volumes
- Conteúdo sensível
- Aprovação hierárquica

## Monitoramento Pré-Envio

### Validação Contínua
- Verificar destinatários ativos
- Validar links e mídia
- Confirmar disponibilidade
- Testes de conectividade

### Alertas Automáticos
- Problemas na lista
- Configurações inválidas
- Limites de envio
- Falhas de sistema

## Relatórios de Agendamento
- Mensagens por período
- Taxa de cancelamento
- Tempo médio de processamento
- Uso por usuário

## Processamento Automático
- Execução pontual
- Retry em falhas
- Log detalhado
- Status em tempo real', 'notificacoes', 108),

('Histórico Enviado', '# Histórico Enviado

## Propósito
Registro completo e auditável de todas as notificações enviadas, com métricas de entrega e engajamento.

## Informações Registradas

### Dados da Mensagem
- Conteúdo completo enviado
- Data/hora de envio
- Canal utilizado
- Tipo de mensagem
- Criador da notificação

### Destinatários
- Lista completa de receptores
- Status individual de entrega
- Falhas de envio
- Motivos de não entrega

### Métricas de Entrega
- Total de envios
- Entregas confirmadas
- Falhas de entrega
- Taxa de sucesso

## Análise de Engajamento

### WhatsApp
- Mensagens entregues
- Mensagens lidas
- Respostas recebidas
- Cliques em links

### Email
- Emails entregues
- Taxa de abertura
- Cliques em links
- Marcações como spam

### SMS
- SMS entregues
- Confirmações de leitura
- Respostas recebidas
- Números inválidos

### Push Notifications
- Notificações entregues
- Aberturas do app
- Interações com conteúdo
- Dispositivos inativos

## Filtros e Buscas

### Por Período
- Data específica
- Intervalo de datas
- Últimos 7/30/90 dias
- Ano completo

### Por Canal
- Separação por tipo
- Comparação entre canais
- Efetividade por canal
- Custos por canal

### Por Criador
- Mensagens por usuário
- Performance individual
- Histórico de envios
- Padrões de uso

### Por Conteúdo
- Busca no texto
- Tipo de mensagem
- Tags e categorias
- Assuntos específicos

## Relatórios Detalhados

### Relatório de Entrega
- Status por destinatário
- Motivos de falha
- Horários de entrega
- Tentativas de reenvio

### Relatório de Engajamento
- Métricas por canal
- Performance por conteúdo
- Tendências temporais
- Segmentação de audiência

### Relatório de Custos
- Custos por envio
- Custos por canal
- ROI estimado
- Comparação mensal

## Exportação de Dados
- Relatórios em PDF
- Planilhas Excel
- Dados brutos CSV
- Gráficos e visualizações

## Reenvio de Mensagens
- Reenviar para falhas
- Novos destinatários
- Conteúdo modificado
- Agendamento diferido

## Auditoria e Compliance
- Log completo de ações
- Timestamps precisos
- Trilha de aprovações
- Dados para auditoria

## Análise de Tendências
- Padrões de abertura
- Horários de maior engajamento
- Conteúdo mais efetivo
- Canais preferidos', 'notificacoes', 109),

('Biblioteca de Vídeos', '# Biblioteca de Vídeos

## Propósito
Repositório centralizado de vídeos institucionais que podem ser utilizados em notificações e comunicações da organização.

## Gestão de Vídeos

### Upload de Vídeos
1. **Seleção do Arquivo**
   - Formatos suportados: MP4, AVI, MOV
   - Tamanho máximo: 500MB
   - Qualidade recomendada: 720p/1080p
   - Duração máxima: 10 minutos

2. **Informações do Vídeo**
   - Título descritivo
   - Descrição detalhada
   - Tags para categorização
   - Nível de acesso

3. **Processamento**
   - Upload automático
   - Compressão inteligente
   - Geração de thumbnail
   - Validação de formato

### Organização
- **Categorias**: Serviços, Eventos, Ensinos, Avisos
- **Tags**: Palavras-chave para busca
- **Favoritos**: Vídeos mais utilizados
- **Recentes**: Uploads recentes

## Integração com Notificações

### Seleção em Mensagens
- Preview integrado
- Informações do vídeo
- Duração e tamanho
- Compatibilidade por canal

### Otimização por Canal
- **WhatsApp**: Compressão automática
- **Email**: Link de visualização
- **App**: Streaming otimizado
- **Web**: Player responsivo

## Controles de Acesso

### Níveis de Permissão
- **Público**: Disponível para todos
- **Interno**: Apenas membros
- **Restrito**: Perfis específicos
- **Privado**: Criador e admins

### Gestão de Uploads
- Aprovação obrigatória
- Revisão de conteúdo
- Controle de qualidade
- Moderação automática

## Funcionalidades Avançadas

### Player Integrado
- Controles completos
- Qualidade adaptativa
- Subtítulos (quando disponível)
- Velocidade de reprodução

### Estatísticas
- Visualizações totais
- Tempo médio assistido
- Dispositivos utilizados
- Origem das visualizações

### Compartilhamento
- Links diretos
- Código embed
- Compartilhamento social
- Download controlado

## Gestão de Armazenamento

### Otimização
- Compressão inteligente
- Múltiplas qualidades
- CDN para distribuição
- Cache automático

### Limpeza Automática
- Remoção de vídeos antigos
- Arquivamento inteligente
- Backup regular
- Controle de espaço

## Relatórios de Uso
- Vídeos mais assistidos
- Engagement por conteúdo
- Uso de armazenamento
- Performance de upload

## Boas Práticas
- Títulos descritivos
- Qualidade adequada
- Duração otimizada
- Conteúdo relevante
- Atualizações regulares', 'notificacoes', 110);
