
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useReportsFilters } from '@/contexts/ReportsContext';

const PaymentMethodsBreakdown = () => {
  const { data: reconciliations, isLoading } = useReconciliations();
  const { filters, isFiltersApplied } = useReportsFilters();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!reconciliations || reconciliations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  // Apply filters to reconciliations
  const filteredReconciliations = reconciliations.filter(rec => {
    // Status filter
    if (filters.status !== 'all' && rec.status !== filters.status) {
      return false;
    }
    
    // Congregation filter
    if (filters.selectedCongregations.length > 0 && !filters.selectedCongregations.includes(rec.congregation_id)) {
      return false;
    }
    
    // Period filter
    if (filters.period !== 'all') {
      const recDate = new Date(rec.created_at);
      const now = new Date();
      const monthsBack = {
        'last-3-months': 3,
        'last-6-months': 6,
        'last-12-months': 12
      }[filters.period] || 0;
      
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      if (recDate < cutoffDate) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate payment methods totals from filtered approved reconciliations
  const paymentMethodTotals = filteredReconciliations
    .filter(rec => rec.status === 'approved')
    .reduce((acc, reconciliation) => {
      acc.cash += Number(reconciliation.cash || 0);
      acc.pix += Number(reconciliation.pix || 0);
      acc.online_pix += Number(reconciliation.online_pix || 0);
      acc.debit += Number(reconciliation.debit || 0);
      acc.credit += Number(reconciliation.credit || 0);
      return acc;
    }, {
      cash: 0,
      pix: 0,
      online_pix: 0,
      debit: 0,
      credit: 0
    });

  // Apply payment method filter
  let paymentData = [
    { name: 'Dinheiro', value: paymentMethodTotals.cash, color: '#dc2626', key: 'cash' },
    { name: 'Pix', value: paymentMethodTotals.pix, color: '#16a34a', key: 'pix' },
    { name: 'Pix Online', value: paymentMethodTotals.online_pix, color: '#2563eb', key: 'online_pix' },
    { name: 'Débito', value: paymentMethodTotals.debit, color: '#ca8a04', key: 'debit' },
    { name: 'Crédito', value: paymentMethodTotals.credit, color: '#9333ea', key: 'credit' }
  ];

  // Filter by payment method if specified
  if (filters.paymentMethod !== 'all') {
    paymentData = paymentData.filter(item => item.key === filters.paymentMethod);
  }

  // Only show payment methods with values > 0
  paymentData = paymentData.filter(item => item.value > 0);

  if (paymentData.length === 0) {
    return (
      <div className="space-y-4">
        {isFiltersApplied && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Nenhum dado encontrado com os filtros aplicados
            </p>
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhuma conciliação aprovada encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFiltersApplied && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Filtros aplicados: {filteredReconciliations.filter(r => r.status === 'approved').length} conciliações aprovadas
          </p>
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={paymentData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {paymentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 gap-2">
        {paymentData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm text-gray-600">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsBreakdown;
