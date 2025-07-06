
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type FinancialRecord = Database['public']['Tables']['financial_records']['Row'];

export const useFinancialRecords = () => {
  return useQuery({
    queryKey: ['financial-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinancialRecord[];
    },
  });
};

export const useFinancialStats = () => {
  return useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      // Query only records for headquarters (congregation_id = 100 or null for sede)
      const { data: records, error } = await supabase
        .from('financial_records')
        .select('*')
        .or('congregation_id.is.null,congregation_id.eq.100');

      if (error) {
        console.error('Error fetching financial records:', error);
        throw error;
      }

      console.log('Financial records fetched for headquarters:', records);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthRecords = records.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });

      const totalIncome = thisMonthRecords
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + Number(record.amount), 0);

      const totalExpense = thisMonthRecords
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + Number(record.amount), 0);

      const balance = totalIncome - totalExpense;

      // Dados para gráfico por categoria (todos os registros da sede)
      const categoryData = records.reduce((acc: any, record) => {
        const category = record.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(record.amount);
        return acc;
      }, {});

      console.log('Financial stats calculated:', {
        totalIncome,
        totalExpense,
        balance,
        totalRecords: records.length,
        thisMonthRecords: thisMonthRecords.length
      });

      return {
        totalIncome,
        totalExpense,
        balance,
        totalRecords: records.length,
        categoryData,
        thisMonthRecords: thisMonthRecords.length
      };
    },
  });
};
