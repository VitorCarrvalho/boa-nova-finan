
import React, { useState } from 'react';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReconciliationSubmissions = () => {
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { data: reconciliations, isLoading } = useReconciliations();
  const { data: congregations } = useCongregations();
  
  const [filters, setFilters] = useState({
    congregationId: 'all',
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Filter reconciliations based on user permissions and date range
  const getFilteredReconciliations = () => {
    if (!reconciliations) return [];

    let filtered = [...reconciliations];

    // Apply user role filters
    if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
      const assignedIds = congregationAccess.assignedCongregations.map(c => c.id);
      filtered = filtered.filter(record => 
        assignedIds.includes(record.congregation_id || '')
      );
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

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const filteredReconciliations = getFilteredReconciliations();

  const getCongregationName = (congregationId: string) => {
    if (congregationId === '00000000-0000-0000-0000-000000000100') return 'Sede';
    const congregation = congregations?.find(c => c.id === congregationId);
    return congregation?.name || 'N/A';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Data de Envio',
      'Congregação',
      'Mês/Ano',
      'Receita Total',
      'Valor a Enviar',
      'Status',
      'Data de Aprovação'
    ];

    const csvData = filteredReconciliations.map(record => [
      format(new Date(record.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      getCongregationName(record.congregation_id),
      format(new Date(record.month + '-01'), 'MM/yyyy'),
      `R$ ${record.total_income.toFixed(2).replace('.', ',')}`,
      `R$ ${record.amount_to_send.toFixed(2).replace('.', ',')}`,
      getStatusLabel(record.status),
      record.approved_at ? format(new Date(record.approved_at), 'dd/MM/yyyy', { locale: ptBR }) : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'conciliacoes-enviadas.csv');
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
              <TableHead>Data de Envio</TableHead>
              <TableHead>Congregação</TableHead>
              <TableHead>Mês/Ano</TableHead>
              <TableHead>Receita Total</TableHead>
              <TableHead>Valor a Enviar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Aprovação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReconciliations.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{getCongregationName(record.congregation_id)}</TableCell>
                <TableCell>
                  {format(new Date(record.month + '-01'), 'MM/yyyy')}
                </TableCell>
                <TableCell className="font-medium">
                  R$ {record.total_income.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell className="font-medium">
                  R$ {record.amount_to_send.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </TableCell>
                <TableCell>
                  {record.approved_at 
                    ? format(new Date(record.approved_at), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
            {filteredReconciliations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhuma conciliação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReconciliationSubmissions;
