export const generateCSVTemplate = () => {
  const headers = [
    'description', // Descrição da despesa (obrigatório)
    'category_name', // Nome da categoria (obrigatório)
    'amount', // Valor (obrigatório)
    'due_date', // Data de vencimento YYYY-MM-DD (obrigatório)
    'payment_method', // Forma de pagamento: pix, transferencia, boleto, dinheiro, cartao, cheque (obrigatório)
    'payee_name', // Nome do favorecido (obrigatório)
    'bank_name', // Nome do banco (opcional)
    'bank_agency', // Agência (opcional)
    'bank_account', // Conta (opcional)
    'congregation_name', // Nome da congregação (obrigatório)
    'observations', // Observações (opcional)
    'invoice_number', // Número da nota fiscal (opcional)
    'is_recurring', // Recorrente: sim/não (opcional)
    'recurrence_frequency', // Frequência: weekly, biweekly, monthly, quarterly, yearly (opcional)
    'recurrence_day_of_week', // Dia da semana 0-6 para semanal/quinzenal (opcional)
    'recurrence_day_of_month', // Dia do mês 1-31 para mensal/trimestral/anual (opcional)
    'next_occurrence_date', // Data da primeira ocorrência YYYY-MM-DD (opcional)
    'is_future_scheduled', // Agendado para futuro: sim/não (opcional)
    'future_scheduled_date', // Data do agendamento YYYY-MM-DD (opcional)
    'urgency_level', // Urgência: normal/urgent (opcional)
    'urgency_description' // Motivo da urgência (opcional)
  ];

  const sampleData = [
    [
      'Pagamento de energia elétrica',
      'Utilidades',
      '150.00',
      '2024-02-15',
      'pix',
      'Companhia de Energia',
      'Banco do Brasil',
      '1234',
      '12345-6',
      'Congregação Central',
      'Conta referente ao mês de janeiro',
      'NF-001',
      'sim',
      'monthly',
      '',
      '15',
      '2024-03-15',
      'não',
      '',
      'normal',
      ''
    ],
    [
      'Compra de material de limpeza',
      'Manutenção',
      '89.50',
      '2024-02-20',
      'boleto',
      'Casa de Materiais XYZ',
      '',
      '',
      '',
      'Congregação Vila Nova',
      '',
      'NF-002',
      'não',
      '',
      '',
      '',
      '',
      'sim',
      '2024-03-01',
      'urgent',
      'Necessário para evento especial'
    ]
  ];

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'accounts-import-template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getTemplateInstructions = (): string => {
  return `
## Instruções do Template de Importação

### Campos Obrigatórios:
- **description**: Descrição clara da despesa
- **category_name**: Nome da categoria (será criada se não existir)
- **amount**: Valor em decimal (use ponto como separador)
- **due_date**: Data de vencimento no formato YYYY-MM-DD
- **payment_method**: Forma de pagamento (pix, transferencia, boleto, dinheiro, cartao, cheque)
- **payee_name**: Nome completo do favorecido
- **congregation_name**: Nome da congregação (será criada se não existir)

### Campos Opcionais:
- **bank_name**: Nome do banco (recomendado para transferências)
- **bank_agency**: Número da agência
- **bank_account**: Número da conta
- **observations**: Observações adicionais
- **invoice_number**: Número da nota fiscal

### Recorrência (todos opcionais):
- **is_recurring**: "sim" para contas recorrentes
- **recurrence_frequency**: weekly, biweekly, monthly, quarterly, yearly
- **recurrence_day_of_week**: 0-6 (domingo=0) para frequência semanal/quinzenal
- **recurrence_day_of_month**: 1-31 para frequência mensal/trimestral/anual
- **next_occurrence_date**: Data da primeira ocorrência (YYYY-MM-DD)

### Agendamento Futuro (todos opcionais):
- **is_future_scheduled**: "sim" para contas agendadas
- **future_scheduled_date**: Data do agendamento (YYYY-MM-DD)

### Urgência (opcionais):
- **urgency_level**: "normal" ou "urgent"
- **urgency_description**: Motivo da urgência

### Observações Importantes:
1. Uma conta NÃO pode ser recorrente e agendada ao mesmo tempo
2. Datas devem estar no formato YYYY-MM-DD
3. Valores devem usar ponto como separador decimal
4. Campos boolean aceitam: sim/não, yes/no, true/false, 1/0
5. Duplicatas (mesma descrição + valor + data) serão ignoradas
6. Categorias e congregações inexistentes serão criadas automaticamente
  `;
};