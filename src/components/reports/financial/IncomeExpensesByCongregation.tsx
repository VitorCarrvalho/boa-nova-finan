import React, { useState } from 'react';
import { useFinancialRecords } from '@/hooks/useFinancialData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IncomeExpensesByCongregationProps {
  transactionTypeFilter: string;
  onTransactionTypeChange: (value: string) => void;
}

const IncomeExpensesByCongregation = ({ 
  transactionTypeFilter, 
  onTransactionTypeChange 
}: IncomeExpensesByCongregationProps) => {
  const { userAccessProfile } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { data: financialRecords, isLoading } = useFinancialRecords();
  const { data: congregations } = useCongregations();
  
  const [filters, setFilters] = useState({
    congregationId: 'all',
    startDate: '',
    endDate: '',
    paymentMethod: 'all',
    category: 'all'
  });

  // Filter records based on user permissions
  const getFilteredRecords = () => {
    if (!financialRecords) return [];

    let filtered = [...financialRecords];

    // Apply user role filters
    if (userAccessProfile === 'Pastor' && congregationAccess?.assignedCongregations) {
      const assignedIds = congregationAccess.assignedCongregations.map(c => c.id);
      assignedIds.push('00000000-0000-0000-0000-000000000100'); // Include headquarters
      filtered = filtered.filter(record => 
        assignedIds.includes(record.congregation_id || '')
      );
    }

    // Apply transaction type filter
    if (transactionTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === transactionTypeFilter);
    }

    // Apply user filters
    if (filters.congregationId !== 'all') {
      filtered = filtered.filter(record => record.congregation_id === filters.congregationId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => 
        new Date(record.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => 
        new Date(record.created_at) <= new Date(filters.endDate)
      );
    }

    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(record => record.method === filters.paymentMethod);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(record => record.category === filters.category);
    }

    return filtered;
  };

  const filteredRecords = getFilteredRecords();

  const getCategoryLabel = (category: string) => {
    const labels = {
      'tithe': 'Dízimo',
      'offering': 'Oferta',
      'online_offering': 'Oferta Online',
      'vow_offering': 'Oferta de Votos',
      'event': 'Evento',
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

  const getCongregationName = (congregationId: string | null) => {
    if (!congregationId) return 'Sede';
    if (congregationId === '00000000-0000-0000-0000-000000000100') return 'Sede';
    const congregation = congregations?.find(c => c.id === congregationId);
    return congregation?.name || 'N/A';
  };

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Congregação',
      'Tipo',
      'Categoria',
      'Valor',
      'Método de Pagamento',
      'Descrição'
    ];

    const csvData = filteredRecords.map(record => [
      format(new Date(record.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      getCongregationName(record.congregation_id),
      record.type === 'income' ? 'Receita' : 'Despesa',
      getCategoryLabel(record.category),
      `R$ ${record.amount.toFixed(2).replace('.', ',')}`,
      getPaymentMethodLabel(record.method),
      record.description || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'receitas-despesas-congregacao.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="transactionType">Tipo de Transação</Label>
          <Select value={transactionTypeFilter} onValueChange={onTransactionTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="congregation">Congregação</Label>
          <Select value={filters.congregationId} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, congregationId: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="00000000-0000-0000-0000-000000000100">Sede</SelectItem>
              {congregations?.map(congregation => (
                <SelectItem key={congregation.id} value={congregation.id}>
                  {congregation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">Data Inicial</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="endDate">Data Final</Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Método de Pagamento</Label>
          <Select value={filters.paymentMethod} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, paymentMethod: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="coin">Moedas</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
              <SelectItem value="credit">Crédito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select value={filters.category} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, category: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="tithe">Dízimo</SelectItem>
              <SelectItem value="offering">Oferta</SelectItem>
              <SelectItem value="online_offering">Oferta Online</SelectItem>
              <SelectItem value="vow_offering">Oferta de Votos</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="debt_paid">Dívida Paga</SelectItem>
              <SelectItem value="salary">Salário</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="supplier">Fornecedor</SelectItem>
              <SelectItem value="project">Projeto</SelectItem>
              <SelectItem value="utility">Utilidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Congregação</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{getCongregationName(record.congregation_id)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.type === 'income' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </TableCell>
                <TableCell>{getCategoryLabel(record.category)}</TableCell>
                <TableCell className="font-medium">
                  R$ {record.amount.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell>{getPaymentMethodLabel(record.method)}</TableCell>
                <TableCell>{record.description || '-'}</TableCell>
              </TableRow>
            ))}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IncomeExpensesByCongregation;
