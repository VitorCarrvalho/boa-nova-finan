
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
        .select(`
          *,
          responsible_pastor:members!financial_records_responsible_pastor_id_fkey(id, name, email),
          congregation:congregations(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (FinancialRecord & {
        responsible_pastor?: { id: string; name: string; email: string | null };
        congregation?: { id: string; name: string };
      })[];
    },
  });
};

export const useFinancialStats = () => {
  return useQuery({
    queryKey: ['financial-stats'],
    queryFn: async () => {
      // First, get the headquarters congregation ID
      const { data: headquarters, error: hqError } = await supabase
        .from('congregations')
        .select('id')
        .eq('name', 'Sede')
        .maybeSingle();

      if (hqError) {
        console.error('Error fetching headquarters:', hqError);
      }

      // Use headquarters ID if found, otherwise get all records
      const query = supabase.from('financial_records').select('*');
      
      if (headquarters?.id) {
        query.eq('congregation_id', headquarters.id);
      }

      const { data: records, error } = await query;

      if (error) {
        console.error('Error fetching financial records:', error);
        throw error;
      }

      console.log('Financial records fetched:', records?.length || 0, 'records');

      if (!records || records.length === 0) {
        return {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          totalRecords: 0,
          categoryData: {},
          thisMonthRecords: 0
        };
      }

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

      // Dados para gráfico por categoria (todos os registros)
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
