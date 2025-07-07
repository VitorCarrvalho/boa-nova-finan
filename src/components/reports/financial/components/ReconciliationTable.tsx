
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReconciliationTableProps {
  reconciliations: any[];
  congregations?: Array<{ id: string; name: string }>;
}

const ReconciliationTable = ({ reconciliations, congregations }: ReconciliationTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mês</TableHead>
            <TableHead>Congregação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Receita Total</TableHead>
            <TableHead>Valor a Enviar</TableHead>
            <TableHead>Data de Envio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reconciliations.map((reconciliation) => (
            <TableRow key={reconciliation.id}>
              <TableCell>
                {format(new Date(reconciliation.month), 'MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                {congregations?.find(c => c.id === reconciliation.congregation_id)?.name || 'N/A'}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  reconciliation.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : reconciliation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {reconciliation.status === 'approved' ? 'Aprovado' : 
                   reconciliation.status === 'pending' ? 'Pendente' : 
                   reconciliation.status}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                R$ {reconciliation.total_income.toFixed(2).replace('.', ',')}
              </TableCell>
              <TableCell className="font-medium">
                R$ {reconciliation.amount_to_send.toFixed(2).replace('.', ',')}
              </TableCell>
              <TableCell>
                {reconciliation.sent_date 
                  ? format(new Date(reconciliation.sent_date), 'dd/MM/yyyy', { locale: ptBR })
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
          {reconciliations.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Nenhuma conciliação encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReconciliationTable;
