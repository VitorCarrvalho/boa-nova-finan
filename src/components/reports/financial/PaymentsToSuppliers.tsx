import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCongregations } from '@/hooks/useCongregationData';
import { useSuppliers } from '@/hooks/useSupplierData';
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

interface SupplierPayment {
  id: string;
  amount: number;
  method: string;
  category: string;
  created_at: string;
  description: string | null;
  congregation_id: string | null;
  supplier_id: string | null;
  responsible_pastor_id: string | null;
  type: string;
  attendees: number | null;
  event_date: string | null;
  event_type: string | null;
  created_by: string;
  updated_at: string;
  suppliers: { name: string } | null;
  members: { name: string } | null;
}

const PaymentsToSuppliers = () => {
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { data: congregations } = useCongregations();
  const { data: suppliers } = useSuppliers();
  
  const [filters, setFilters] = useState({
    supplierId: 'all',
    congregationId: 'all',
    startDate: '',
    endDate: '',
    paymentMethod: 'all'
  });

  // Fetch supplier payments
  const { data: supplierPayments, isLoading } = useQuery({
    queryKey: ['supplier-payments', userRole, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      let query = supabase
        .from('financial_records')
        .select(`
          *,
          suppliers (name),
          members!financial_records_responsible_pastor_id_fkey (name)
        `)
        .eq('type', 'expense')
        .not('supplier_id', 'is', null)
        .order('created_at', { ascending: false });

      // Apply user role filters
      if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
        const assignedIds = congregationAccess.assignedCongregations.map(c => c.id);
        assignedIds.push('00000000-0000-0000-0000-000000000100'); // Include headquarters
        query = query.in('congregation_id', assignedIds);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching supplier payments:', error);
        return [];
      }
      return data as SupplierPayment[];
    },
    enabled: !!userRole,
  });

  // Filter payments based on user selections
  const getFilteredPayments = () => {
    if (!supplierPayments) return [];

    let filtered = [...supplierPayments];

    if (filters.supplierId !== 'all') {
      filtered = filtered.filter(payment => payment.supplier_id === filters.supplierId);
    }

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

  const filteredPayments = getFilteredPayments();

  // Group payments by supplier for totals
  const supplierTotals = filteredPayments.reduce((acc, payment) => {
    const supplierId = payment.supplier_id;
    if (!supplierId) return acc;
    
    if (!acc[supplierId]) {
      acc[supplierId] = {
        name: payment.suppliers?.name || 'N/A',
        total: 0,
        count: 0
      };
    }
    
    acc[supplierId].total += Number(payment.amount);
    acc[supplierId].count += 1;
    
    return acc;
  }, {} as Record<string, { name: string; total: number; count: number }>);

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

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Fornecedor',
      'Valor',
      'Método de Pagamento',
      'Categoria',
      'Pastor Responsável',
      'Congregação',
      'Descrição'
    ];

    const csvData = filteredPayments.map(payment => [
      format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR }),
      payment.suppliers?.name || 'N/A',
      `R$ ${payment.amount.toFixed(2).replace('.', ',')}`,
      getPaymentMethodLabel(payment.method),
      getCategoryLabel(payment.category),
      payment.members?.name || 'N/A',
      getCongregationName(payment.congregation_id),
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

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Supplier Totals Summary */}
      {Object.keys(supplierTotals).length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Totais por Fornecedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(supplierTotals).map(([supplierId, data]) => (
              <div key={supplierId} className="bg-white p-3 rounded border">
                <div className="font-medium">{data.name}</div>
                <div className="text-sm text-gray-600">{data.count} pagamentos</div>
                <div className="font-bold text-blue-600">
                  R$ {data.total.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="supplier">Fornecedor</Label>
          <Select value={filters.supplierId} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, supplierId: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {suppliers?.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
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
            {filteredPayments.map((payment) => (
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
            {filteredPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhum pagamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentsToSuppliers;
