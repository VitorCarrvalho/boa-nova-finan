
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupplierPayment, SupplierPaymentFilters, SupplierTotal } from '../types/SupplierPaymentTypes';

export const filterPayments = (payments: SupplierPayment[], filters: SupplierPaymentFilters): SupplierPayment[] => {
  let filtered = [...payments];

  if (filters.congregationId !== 'all') {
    filtered = filtered.filter(payment => payment.congregation_id === filters.congregationId);
  }

  if (filters.startDate) {
    filtered = filtered.filter(payment => 
      new Date(payment.created_at) >= new Date(filters.startDate)
    );
  }

  if (filters.endDate) {
    filtered = filtered.filter(payment => 
      new Date(payment.created_at) <= new Date(filters.endDate)
    );
  }

  if (filters.paymentMethod !== 'all') {
    filtered = filtered.filter(payment => payment.method === filters.paymentMethod);
  }

  return filtered;
};

export const calculateSupplierTotals = (payments: SupplierPayment[]): Record<string, SupplierTotal> => {
  return payments.reduce((acc, payment) => {
    const category = payment.category;
    
    if (!acc[category]) {
      acc[category] = {
        name: getCategoryLabel(category),
        total: 0,
        count: 0
      };
    }
    
    acc[category].total += Number(payment.amount);
    acc[category].count += 1;
    
    return acc;
  }, {} as Record<string, SupplierTotal>);
};

export const getCongregationName = (congregationId: string | null, congregations: any[]) => {
  if (!congregationId) return 'Sede';
  if (congregationId === '00000000-0000-0000-0000-000000000100') return 'Sede';
  const congregation = congregations?.find(c => c.id === congregationId);
  return congregation?.name || 'N/A';
};

export const getCategoryLabel = (category: string) => {
  const labels = {
    'debt_paid': 'Dívida Paga',
    'salary': 'Salário',
    'maintenance': 'Manutenção',
    'supplier': 'Fornecedor',
    'project': 'Projeto',
    'utility': 'Utilidade'
  };
  return labels[category as keyof typeof labels] || category;
};

export const getPaymentMethodLabel = (method: string) => {
  const labels = {
    'cash': 'Dinheiro',
    'coin': 'Moedas',
    'pix': 'PIX',
    'debit': 'Débito',
    'credit': 'Crédito'
  };
  return labels[method as keyof typeof labels] || method;
};

export const exportToCSV = (payments: SupplierPayment[], congregations: any[]) => {
  const headers = [
    'Data',
    'Valor',
    'Método de Pagamento',
    'Categoria',
    'Congregação',
    'Descrição'
  ];

  const csvData = payments.map(payment => [
    format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR }),
    `R$ ${payment.amount.toFixed(2).replace('.', ',')}`,
    getPaymentMethodLabel(payment.method),
    getCategoryLabel(payment.category),
    getCongregationName(payment.congregation_id, congregations),
    payment.description || ''
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'pagamentos-fornecedores.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
