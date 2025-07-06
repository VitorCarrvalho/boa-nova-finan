
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCongregations } from '@/hooks/useCongregationData';
import { SupplierPayment } from '../types/SupplierPaymentTypes';

interface SupplierPaymentsTableProps {
  payments: SupplierPayment[];
}

const SupplierPaymentsTable = ({ payments }: SupplierPaymentsTableProps) => {
  const { data: congregations } = useCongregations();

  const getCongregationName = (congregationId: string | null) => {
    if (!congregationId) return 'Sede';
    if (congregationId === '00000000-0000-0000-0000-000000000100') return 'Sede';
    const congregation = congregations?.find(c => c.id === congregationId);
    return congregation?.name || 'N/A';
  };

  const getCategoryLabel = (category: string) => {
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

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      'cash': 'Dinheiro',
      'coin': 'Moedas',
      'pix': 'PIX',
      'debit': 'Débito',
      'credit': 'Crédito'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Pastor Responsável</TableHead>
            <TableHead>Congregação</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">
                {payment.suppliers?.name || 'N/A'}
              </TableCell>
              <TableCell className="font-medium">
                R$ {payment.amount.toFixed(2).replace('.', ',')}
              </TableCell>
              <TableCell>{getPaymentMethodLabel(payment.method)}</TableCell>
              <TableCell>{getCategoryLabel(payment.category)}</TableCell>
              <TableCell>{payment.members?.name || 'N/A'}</TableCell>
              <TableCell>{getCongregationName(payment.congregation_id)}</TableCell>
              <TableCell>{payment.description || '-'}</TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Nenhum pagamento encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplierPaymentsTable;
