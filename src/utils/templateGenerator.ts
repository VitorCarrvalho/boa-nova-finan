import * as XLSX from 'xlsx';

interface Congregation {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

export const generateCSVTemplate = (congregations?: Congregation[]) => {
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

  // Use primeira congregação disponível para exemplo, ou valor padrão
  const exampleCongregation = congregations?.[0]?.name || 'Congregação Central';
  const exampleCongregation2 = congregations?.[1]?.name || 'Congregação Vila Nova';

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
      exampleCongregation,
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
      exampleCongregation2,
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

  // Se congregações disponíveis, gerar Excel, senão CSV
  if (congregations && congregations.length > 0) {
    generateExcelTemplate(headers, sampleData, congregations);
  } else {
    generateCSVOnly(headers, sampleData);
  }
};

const generateCSVOnly = (headers: string[], sampleData: string[][]) => {
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

const generateExcelTemplate = (headers: string[], sampleData: string[][], congregations: Congregation[]) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Template de Importação
  const templateData = [
    headers,
    ...sampleData
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(templateData);

  // Configurar largura das colunas
  const colWidths = headers.map((header, index) => {
    if (header === 'description') return { wch: 30 };
    if (header === 'congregation_name') return { wch: 25 };
    if (header === 'payee_name') return { wch: 25 };
    if (header === 'observations') return { wch: 30 };
    return { wch: 15 };
  });
  ws1['!cols'] = colWidths;

  // Aba 2: Lista de Congregações
  const congregationData = [
    ['Nome da Congregação', 'Cidade', 'Estado'],
    ...congregations.map(cong => [
      cong.name,
      cong.city || '',
      cong.state || ''
    ])
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(congregationData);
  ws2['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];

  // Aba 3: Instruções
  const instructionData = [
    ['INSTRUÇÕES DE PREENCHIMENTO'],
    [''],
    ['CAMPOS OBRIGATÓRIOS:'],
    ['description', 'Descrição clara da despesa'],
    ['category_name', 'Nome da categoria (será criada se não existir)'],
    ['amount', 'Valor em decimal (use ponto como separador)'],
    ['due_date', 'Data de vencimento no formato YYYY-MM-DD'],
    ['payment_method', 'pix, transferencia, boleto, dinheiro, cartao, cheque'],
    ['payee_name', 'Nome completo do favorecido'],
    ['congregation_name', 'Use um nome da aba "Congregações"'],
    [''],
    ['CAMPOS OPCIONAIS:'],
    ['bank_name', 'Nome do banco (recomendado para transferências)'],
    ['bank_agency', 'Número da agência'],
    ['bank_account', 'Número da conta'],
    ['observations', 'Observações adicionais'],
    ['invoice_number', 'Número da nota fiscal'],
    [''],
    ['RECORRÊNCIA (todos opcionais):'],
    ['is_recurring', '"sim" para contas recorrentes'],
    ['recurrence_frequency', 'weekly, biweekly, monthly, quarterly, yearly'],
    ['recurrence_day_of_week', '0-6 (domingo=0) para semanal/quinzenal'],
    ['recurrence_day_of_month', '1-31 para mensal/trimestral/anual'],
    ['next_occurrence_date', 'Data da primeira ocorrência (YYYY-MM-DD)'],
    [''],
    ['AGENDAMENTO FUTURO:'],
    ['is_future_scheduled', '"sim" para contas agendadas'],
    ['future_scheduled_date', 'Data do agendamento (YYYY-MM-DD)'],
    [''],
    ['URGÊNCIA:'],
    ['urgency_level', '"normal" ou "urgent"'],
    ['urgency_description', 'Motivo da urgência'],
    [''],
    ['OBSERVAÇÕES IMPORTANTES:'],
    ['', 'Uma conta NÃO pode ser recorrente e agendada ao mesmo tempo'],
    ['', 'Datas devem estar no formato YYYY-MM-DD'],
    ['', 'Valores devem usar ponto como separador decimal'],
    ['', 'Campos boolean aceitam: sim/não, yes/no, true/false, 1/0'],
    ['', 'Duplicatas (mesma descrição + valor + data) serão ignoradas'],
    ['', 'Categorias e congregações inexistentes serão criadas automaticamente']
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(instructionData);
  ws3['!cols'] = [{ wch: 25 }, { wch: 50 }];

  // Adicionar abas ao workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'Importação');
  XLSX.utils.book_append_sheet(wb, ws2, 'Congregações');
  XLSX.utils.book_append_sheet(wb, ws3, 'Instruções');

  // Download do arquivo
  XLSX.writeFile(wb, 'accounts-import-template.xlsx');
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