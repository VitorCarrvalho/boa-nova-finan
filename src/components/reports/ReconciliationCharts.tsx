
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useReportsFilters } from '@/contexts/ReportsContext';

const ReconciliationCharts = () => {
  const { data: reconciliations, isLoading: reconciliationsLoading } = useReconciliations();
  const { data: congregations, isLoading: congregationsLoading } = useCongregations();
  const { filters, isFiltersApplied } = useReportsFilters();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (reconciliationsLoading || congregationsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!reconciliations || !congregations) {
    return (
      <div className="space-y-6">
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

  // Process data for charts - group by month and congregation
  const processedData = () => {
    const monthlyData: { [key: string]: { [key: string]: number } } = {};
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      months.push({ key: monthKey, label: monthLabel });
      monthlyData[monthKey] = {};
    }

    // Initialize data structure
    congregations.forEach(congregation => {
      months.forEach(month => {
        monthlyData[month.key][congregation.name] = 0;
      });
    });

    // Populate with filtered reconciliation data
    filteredReconciliations
      .filter(rec => rec.status === 'approved')
      .forEach(reconciliation => {
        const monthKey = reconciliation.month.slice(0, 7); // Extract YYYY-MM
        const congregation = congregations.find(c => c.id === reconciliation.congregation_id);
        
        if (monthlyData[monthKey] && congregation) {
          monthlyData[monthKey][congregation.name] = (monthlyData[monthKey][congregation.name] || 0) + Number(reconciliation.total_income);
        }
      });

    // Convert to chart format
    return months.map(month => {
      const dataPoint: any = { month: month.label };
      congregations.forEach(congregation => {
        dataPoint[congregation.name] = monthlyData[month.key][congregation.name] || 0;
      });
      return dataPoint;
    });
  };

  const chartData = processedData();
  const congregationNames = congregations.map(c => c.name);
  const colors = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea', '#ec4899'];

  return (
    <div className="space-y-6">
      {isFiltersApplied && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Filtros aplicados: {filteredReconciliations.length} conciliações encontradas
          </p>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-4">Gráfico de Colunas - Por Mês e Congregação</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {congregationNames.map((name, index) => (
              <Bar 
                key={name} 
                dataKey={name} 
                fill={colors[index % colors.length]} 
                name={name} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Gráfico de Linha - Histórico por Congregação</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {congregationNames.map((name, index) => (
              <Line 
                key={name}
                type="monotone" 
                dataKey={name} 
                stroke={colors[index % colors.length]} 
                strokeWidth={2} 
                name={name} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReconciliationCharts;
