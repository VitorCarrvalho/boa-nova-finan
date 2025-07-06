
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useReconciliations } from '@/hooks/useReconciliationData';

const PaymentMethodsBreakdown = () => {
  const { data: reconciliations, isLoading } = useReconciliations();

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

  // Calculate payment methods totals from approved reconciliations
  const paymentMethodTotals = reconciliations
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

  const paymentData = [
    { name: 'Dinheiro', value: paymentMethodTotals.cash, color: '#dc2626' },
    { name: 'Pix', value: paymentMethodTotals.pix, color: '#16a34a' },
    { name: 'Pix Online', value: paymentMethodTotals.online_pix, color: '#2563eb' },
    { name: 'Débito', value: paymentMethodTotals.debit, color: '#ca8a04' },
    { name: 'Crédito', value: paymentMethodTotals.credit, color: '#9333ea' }
  ].filter(item => item.value > 0); // Only show payment methods with values

  if (paymentData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhuma conciliação aprovada encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
