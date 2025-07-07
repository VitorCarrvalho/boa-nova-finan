
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useReconciliationFilters = () => {
  const [filters, setFilters] = useState({
    congregationId: 'all',
    status: 'all',
    period: 'last-6-months'
  });

  return { filters, setFilters };
};

export const useFilteredReconciliations = (reconciliations: any[], filters: any) => {
  return useMemo(() => {
    if (!reconciliations) return [];

    let filtered = [...reconciliations];

    // Apply congregation filter
    if (filters.congregationId !== 'all') {
      filtered = filtered.filter(rec => rec.congregation_id === filters.congregationId);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(rec => rec.status === filters.status);
    }

    // Apply period filter
    const now = new Date();
    const monthsBack = filters.period === 'last-3-months' ? 3 : 
                      filters.period === 'last-6-months' ? 6 : 
                      filters.period === 'last-12-months' ? 12 : 0;
    
    if (monthsBack > 0) {
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      filtered = filtered.filter(rec => new Date(rec.month) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [reconciliations, filters]);
};

export const useChartData = (reconciliations: any[], congregations: any[]) => {
  return useMemo(() => {
    if (!reconciliations || !congregations) return [];

    const months = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: ptBR });
      months.push({ key: monthKey, label: monthLabel });
    }

    // Initialize data structure
    const chartData = months.map(month => ({
      month: month.label,
      ...congregations.reduce((acc, cong) => {
        acc[cong.name] = 0;
        return acc;
      }, {} as Record<string, number>)
    }));

    // Populate with reconciliation data
    reconciliations
      .filter(rec => rec.status === 'approved')
      .forEach(rec => {
        const monthKey = format(new Date(rec.month), 'MMM yyyy', { locale: ptBR });
        const congregation = congregations.find(c => c.id === rec.congregation_id);
        
        if (congregation) {
          const dataPoint = chartData.find(d => d.month === monthKey);
          if (dataPoint) {
            dataPoint[congregation.name] = Number(rec.total_income);
          }
        }
      });

    return chartData;
  }, [reconciliations, congregations]);
};
