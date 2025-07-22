-- Finalizar com seções de apoio: Glossário, FAQ, Boas Práticas, etc.

INSERT INTO public.documentation_sections (title, content, module_key, section_order) VALUES
('Glossário de Termos', '# Glossário de Termos

## A
**Access Profile (Perfil de Acesso)**: Conjunto de permissões que define quais módulos e ações um usuário pode executar no sistema.

**Admin**: Usuário com privilégios administrativos, podendo gerenciar outros usuários e configurações do sistema.

**Approval (Aprovação)**: Processo de validação de uma solicitação por um usuário autorizado.

**Accounts Payable (Contas a Pagar)**: Módulo responsável pelo gerenciamento de despesas e pagamentos da organização.

**Auditoria**: Processo de verificação e controle das operações realizadas no sistema.

## B
**Backup**: Cópia de segurança dos dados do sistema.

**Business Rules (Regras de Negócio)**: Conjunto de normas que definem como os processos devem funcionar.

## C
**Congregação**: Unidade local da igreja com administração própria.

**Conciliação**: Processo mensal de prestação de contas das congregações para a sede.

**CRUD**: Create, Read, Update, Delete - operações básicas de banco de dados.

## D
**Dashboard**: Painel principal com visão geral dos indicadores do sistema.

**Due Date (Data de Vencimento)**: Data limite para pagamento de uma conta.

## E
**Edge Function**: Função serverless executada na borda da rede Supabase.

**Export**: Funcionalidade de extrair dados do sistema em diferentes formatos.

## F
**Financial Records (Registros Financeiros)**: Dados de receitas e despesas da organização.

**Fornecedor**: Empresa ou pessoa que presta serviços para a organização.

## G
**Gestão de Acessos**: Módulo responsável pelo controle de usuários e permissões.

## H
**Hierarquia**: Estrutura organizacional que define níveis de autoridade.

## I
**IPTM**: Igreja Pentecostal Tabernáculo da Misericórdia.

## J
**JWT**: JSON Web Token - padrão de autenticação utilizado pelo sistema.

## K
**KPI**: Key Performance Indicator - indicadores-chave de performance.

## L
**Log**: Registro detalhado de ações realizadas no sistema.

**LGPD**: Lei Geral de Proteção de Dados.

## M
**Membro**: Pessoa cadastrada como participante da igreja.

**Ministério**: Departamento ou área específica de atuação dentro da igreja.

**Migration**: Script de modificação da estrutura do banco de dados.

## N
**Notificação**: Mensagem enviada aos usuários através de diferentes canais.

## O
**Override**: Ação que sobrepõe uma regra ou permissão normal do sistema.

## P
**Pastor**: Líder religioso responsável por uma congregação.

**Permission (Permissão)**: Autorização específica para executar uma ação no sistema.

**PIX**: Sistema de pagamentos instantâneos brasileiro.

**Profile (Perfil)**: Conjunto de dados e permissões de um usuário.

## Q
**Query**: Consulta realizada no banco de dados.

## R
**RLS**: Row Level Security - segurança a nível de linha no banco de dados.

**Role (Função)**: Papel desempenhado por um usuário no sistema.

**Reconciliation (Conciliação)**: Processo de conferência e aprovação de dados financeiros.

## S
**Super Admin**: Usuário com máximo nível de privilégios no sistema.

**Supabase**: Plataforma de desenvolvimento backend utilizada pelo sistema.

**SLA**: Service Level Agreement - acordo de nível de serviço.

## T
**Trigger**: Gatilho automático executado pelo banco de dados.

**Timestamp**: Marca temporal indicando data e hora de uma operação.

## U
**UUID**: Identificador único universal utilizado como chave primária.

**Upload**: Processo de envio de arquivos para o sistema.

## V
**Validation (Validação)**: Verificação de conformidade de dados ou processos.

**Vencimento**: Data limite para cumprimento de uma obrigação.

## W
**Workflow**: Fluxo de trabalho ou processo definido no sistema.

## Z
**Zone**: Fuso horário utilizado pelo sistema para registros temporais.', 'apoio', 119),

('FAQ - Perguntas Frequentes', '# FAQ - Perguntas Frequentes

## Acesso e Login

### Como faço para acessar o sistema?
1. Acesse o endereço web fornecido pela administração
2. Clique em "Fazer Login" 
3. Use suas credenciais de email e senha
4. Aguarde aprovação se for seu primeiro acesso

### Esqueci minha senha, como recuperar?
1. Na tela de login, clique em "Esqueci minha senha"
2. Digite seu email cadastrado
3. Verifique sua caixa de email (e spam)
4. Clique no link recebido para redefinir
5. Crie uma nova senha seguindo os critérios

### Meu acesso foi negado, o que fazer?
- Verifique se seu cadastro foi aprovado por um administrador
- Confirme se está usando o email correto
- Entre em contato com a administração se o problema persistir

### Posso alterar minha foto de perfil?
Sim! Na barra lateral esquerda, passe o mouse sobre sua foto e clique no ícone da câmera. Aceita JPG e PNG até 2MB.

## Navegação e Interface

### Como navegar entre os módulos?
Use o menu lateral esquerdo para acessar os diferentes módulos do sistema. Só aparecerão os módulos que você tem permissão para acessar.

### O sistema funciona no celular?
Sim, o sistema é responsivo e funciona bem em dispositivos móveis. Use o menu hambúrguer (três linhas) para navegar.

### Como exportar relatórios?
Na maioria dos módulos, há um botão "Exportar" que permite baixar dados em PDF ou Excel, conforme suas permissões.

## Contas a Pagar

### Como criar uma nova conta a pagar?
1. Acesse "Contas a Pagar" > "Incluir Nova Conta"
2. Preencha todos os campos obrigatórios
3. Anexe comprovantes (obrigatório para valores > R$ 500)
4. Revise e confirme a solicitação

### Qual o prazo para aprovação de contas?
- Aprovação inicial: até 2 dias úteis
- Autorização final: até 1 dia útil
- Pagamento: varia conforme o método (PIX é imediato)

### Posso editar uma conta após criar?
Apenas enquanto estiver "Pendente de Aprovação" e apenas o criador pode editar. Após aprovação, não é mais possível editar.

### Por que minha conta foi rejeitada?
Verifique o email de notificação que contém o motivo da rejeição. Corrija os problemas apontados e crie uma nova solicitação.

## Conciliações

### Quando devo enviar a conciliação mensal?
Entre os dias 1 e 5 do mês seguinte ao período de referência. Ex: conciliação de janeiro deve ser enviada entre 1-5 de fevereiro.

### O que acontece se eu enviar atrasado?
O sistema permite envio com atraso, mas haverá alertas automáticos para a administração. Atrasos recorrentes podem resultar em medidas administrativas.

### Posso corrigir uma conciliação já enviada?
Se ainda estiver pendente de aprovação, entre em contato com a administração. Se já foi aprovada, será necessário justificativa para alteração.

### Como calcular o valor de repasse?
O sistema calcula automaticamente 15% do total de receitas. Verifique se todos os métodos de pagamento foram informados corretamente.

## Relatórios

### Não consigo acessar determinados relatórios
Verifique suas permissões. Alguns relatórios são restritos a perfis específicos (Admin, Financeiro, etc.).

### Os dados do relatório estão incorretos
1. Verifique os filtros aplicados (data, congregação, etc.)
2. Confirme se tem acesso aos dados necessários
3. Entre em contato com suporte se persistir

### Como agendar relatórios automáticos?
Apenas administradores podem configurar relatórios automáticos. Solicite à administração se necessário.

## Permissões e Acesso

### Por que não vejo todos os módulos?
O sistema mostra apenas os módulos que você tem permissão para acessar, baseado no seu perfil de acesso.

### Como solicitar novas permissões?
Entre em contato com um administrador explicando sua necessidade. Ele avaliará e poderá alterar seu perfil de acesso.

### Posso ver dados de outras congregações?
Depende do seu perfil:
- **Pastores**: Apenas sua congregação
- **Admins**: Todas as congregações  
- **Analistas**: Visualização de todas
- **Outros**: Conforme definido no perfil

## Problemas Técnicos

### O sistema está lento
1. Verifique sua conexão com a internet
2. Tente atualizar a página (F5)
3. Limpe o cache do navegador
4. Se persistir, reporte o problema

### Erro ao salvar dados
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Confirme se os dados estão no formato correto
3. Tente novamente em alguns minutos
4. Entre em contato com suporte se necessário

### Não recebo emails do sistema
1. Verifique sua caixa de spam
2. Confirme se o email está correto no seu perfil
3. Adicione o domínio do sistema à lista de remetentes confiáveis

## Segurança

### Minha conta foi comprometida?
Se suspeitar de acesso não autorizado:
1. Mude sua senha imediatamente
2. Notifique a administração
3. Verifique o log de atividades no seu perfil

### Como manter minha conta segura?
- Use senhas fortes e únicas
- Não compartilhe suas credenciais
- Faça logout ao usar computadores compartilhados
- Mantenha seu email seguro

### Alguém pode ver meus dados?
O sistema possui controles rígidos de acesso. Apenas usuários com permissão específica podem ver seus dados, e todas as visualizações são registradas em log.

## Suporte

### Como entrar em contato com o suporte?
- Email: [inserir email de suporte]
- Telefone: [inserir telefone]
- Através de administradores locais

### Horário de funcionamento do suporte
Segunda a sexta, das 8h às 18h (horário de Brasília). Emergências podem ser reportadas fora do horário através dos contatos de emergência.

### Como reportar bugs ou sugestões?
Use os canais oficiais de suporte ou fale com um administrador. Descreva detalhadamente o problema ou sugestão.', 'apoio', 120),

('Boas Práticas por Módulo', '# Boas Práticas por Módulo

## Dashboard
### Navegação Eficiente
- Acesse o Dashboard primeiro para ter visão geral do sistema
- Use os widgets para identificar rapidamente itens que precisam de atenção
- Configure filtros de data conforme sua necessidade de análise

### Análise de Dados
- Analise tendências mensais para identificar padrões
- Compare dados entre congregações para benchmarking
- Utilize os gráficos para apresentações executivas

## Financeiro
### Cadastro de Transações
- **Descrições Claras**: Use descrições detalhadas que facilitem futuras consultas
- **Categorização Adequada**: Escolha a categoria correta para facilitar relatórios
- **Documentação**: Sempre anexe comprovantes quando possível
- **Timing**: Registre transações próximo à data de ocorrência

### Controle de Fluxo
- Monitore regularmente o fluxo de caixa
- Planeje gastos baseado em receitas projetadas
- Mantenha reserva para emergências
- Analise variações significativas mensalmente

## Contas a Pagar
### Criação de Solicitações
- **Planejamento**: Crie solicitações com antecedência ao vencimento
- **Detalhamento**: Forneça máximo de informações na descrição
- **Anexos**: Sempre inclua notas fiscais ou comprovantes
- **Urgência**: Use classificação de urgência adequadamente

### Aprovações
- **Agilidade**: Processe aprovações dentro dos prazos estabelecidos
- **Critério**: Analise adequação orçamentária antes de aprovar
- **Comunicação**: Dê feedbacks claros em rejeições
- **Documentação**: Mantenha registro das justificativas

### Pagamentos
- **Verificação**: Confira dados bancários antes do pagamento
- **Comprovação**: Sempre gere e arquive comprovantes
- **Prazo**: Respeite datas de vencimento acordadas
- **Conciliação**: Confira pagamentos com extratos bancários

## Conciliações
### Preparação Mensal
- **Coleta Sistemática**: Organize dados durante todo o mês
- **Conferência**: Valide valores antes do envio
- **Documentação**: Mantenha comprovantes organizados
- **Pontualidade**: Envie sempre dentro do prazo

### Qualidade dos Dados
- **Precisão**: Confira cálculos múltiplas vezes
- **Completude**: Preencha todos os campos obrigatórios
- **Consistência**: Mantenha padrão de classificação
- **Backup**: Guarde cópia dos dados enviados

## Membros
### Cadastro Completo
- **Informações Atualizadas**: Mantenha dados sempre atuais
- **Privacidade**: Respeite a LGPD e dados sensíveis
- **Categorização**: Use ministérios e departamentos adequadamente
- **Histórico**: Registre eventos importantes (batismo, casamento, etc.)

### Gestão de Relacionamento
- **Comunicação**: Use dados para comunicação direcionada
- **Segmentação**: Agrupe membros por características relevantes
- **Acompanhamento**: Monitore participação e engajamento
- **Cuidado Pastoral**: Use informações para cuidado adequado

## Eventos
### Planejamento
- **Antecedência**: Cadastre eventos com antecedência adequada
- **Detalhamento**: Forneça informações completas e claras
- **Capacidade**: Defina limites realistas de participantes
- **Recursos**: Planeje recursos necessários antecipadamente

### Execução
- **Controle de Presença**: Monitore inscrições e comparecimento
- **Comunicação**: Mantenha participantes informados
- **Feedback**: Colete avaliações pós-evento
- **Documentação**: Registre resultados e aprendizados

## Relatórios
### Geração Eficiente
- **Filtros Adequados**: Use filtros para dados relevantes
- **Periodicidade**: Estabeleça rotina de geração de relatórios
- **Formato**: Escolha formato adequado ao uso (PDF para apresentação, Excel para análise)
- **Distribuição**: Compartilhe com stakeholders relevantes

### Análise de Dados
- **Tendências**: Identifique padrões ao longo do tempo
- **Comparações**: Use benchmarks internos e externos
- **Ações**: Converta insights em ações práticas
- **Histórico**: Mantenha série histórica para análises

## Configurações
### Gestão de Sistema
- **Backup Regular**: Mantenha backups atualizados
- **Teste**: Teste configurações em ambiente controlado
- **Documentação**: Documente todas as alterações
- **Acesso Restrito**: Limite acesso a configurações críticas

### Atualizações
- **Planejamento**: Agende atualizações em horários adequados
- **Comunicação**: Avise usuários sobre mudanças
- **Rollback**: Tenha plano de reversão se necessário
- **Validação**: Teste funcionalidades após atualizações

## Gestão de Acessos
### Aprovação de Usuários
- **Critério**: Estabeleça critérios claros para aprovação
- **Verificação**: Valide identidade e necessidade de acesso
- **Perfil Adequado**: Atribua perfil mínimo necessário
- **Documentação**: Registre justificativas de aprovação/rejeição

### Monitoramento
- **Atividade Regular**: Monitore uso regular do sistema
- **Revisão Periódica**: Revise permissões trimestralmente
- **Auditoria**: Mantenha logs de acesso e ações
- **Resposta a Incidentes**: Aja rapidamente em suspeitas de abuso

## Notificações
### Comunicação Efetiva
- **Segmentação**: Envie mensagens para públicos específicos
- **Timing**: Escolha horários adequados para cada tipo de mensagem
- **Conteúdo Relevante**: Envie apenas informações pertinentes
- **Call-to-Action**: Inclua ações claras quando necessário

### Gestão de Frequência
- **Equilíbrio**: Evite spam mas mantenha comunicação regular
- **Priorização**: Use níveis de prioridade adequadamente
- **Feedback**: Monitore taxas de abertura e engajamento
- **Opt-out**: Respeite solicitações de descadastro

## Geral - Segurança
### Acesso Seguro
- **Senhas Fortes**: Use senhas complexas e únicas
- **Logout**: Sempre faça logout em computadores compartilhados
- **Dois Fatores**: Use autenticação de dois fatores quando disponível
- **Suspeitas**: Reporte atividades suspeitas imediatamente

### Proteção de Dados
- **Confidencialidade**: Não compartilhe informações sensíveis
- **Backup Pessoal**: Não faça cópias não autorizadas
- **LGPD**: Respeite direitos de privacidade dos titulares
- **Acesso Mínimo**: Use apenas dados necessários para sua função', 'apoio', 121);