
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Edit, Trash2 } from 'lucide-react';
import { useFinancialRecords } from '@/hooks/useFinancialData';
import { usePermissions } from '@/hooks/usePermissions';

const FinancialTable = () => {
  const { data: records, isLoading } = useFinancialRecords();
  const { canEditModule, canDeleteModule, canExportModule } = usePermissions();
  
  const canEdit = canEditModule('financeiro');
  const canDelete = canDeleteModule('financeiro');
  const canExport = canExportModule('financeiro');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      tithe: 'Dízimo',
      offering: 'Oferta',
      online_offering: 'Oferta Online',
      vow_offering: 'Oferta de Votos',
      event: 'Evento',
      debt_paid: 'Dívida Paga',
      salary: 'Salário',
      maintenance: 'Manutenção',
      supplier: 'Fornecedor',
      project: 'Projeto',
      utility: 'Utilidade'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      cash: 'Dinheiro',
      coin: 'Moedas',
      pix: 'PIX',
      debit: 'Débito',
      credit: 'Crédito'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const exportToCSV = () => {
    if (!records) return;

    const headers = [
      'Data',
      'Tipo',
      'Categoria',
      'Valor',
      'Método',
      'Tipo de Evento',
      'Data do Evento',
      'Participantes',
      'Descrição'
    ];

    const csvData = records.map(record => [
      formatDate(record.created_at),
      record.type === 'income' ? 'Entrada' : 'Saída',
      getCategoryLabel(record.category),
      record.amount,
      getMethodLabel(record.method),
      record.event_type || '',
      record.event_date ? formatDate(record.event_date) : '',
      record.attendees || '',
      record.description || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_financeiros_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registros Financeiros</CardTitle>
        {canExport && (
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Evento</TableHead>
                {(canEdit || canDelete) && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={record.type === 'income' ? 'default' : 'destructive'}>
                      {record.type === 'income' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getCategoryLabel(record.category)}</TableCell>
                  <TableCell className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(Number(record.amount))}
                  </TableCell>
                  <TableCell>{getMethodLabel(record.method)}</TableCell>
                  <TableCell>
                    {record.event_type && (
                      <div>
                        <div className="font-medium">{record.event_type}</div>
                        {record.event_date && (
                          <div className="text-sm text-gray-500">
                            {formatDate(record.event_date)}
                          </div>
                        )}
                        {record.attendees && (
                          <div className="text-sm text-gray-500">
                            {record.attendees} participantes
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell>
                      <div className="flex gap-2">
                        {canEdit && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {(!records || records.length === 0) && (
                <TableRow>
                  <TableCell colSpan={(canEdit || canDelete) ? 7 : 6} className="text-center py-8 text-gray-500">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialTable;
