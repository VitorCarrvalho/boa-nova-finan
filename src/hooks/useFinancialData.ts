
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';

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
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['financial-stats', userRole, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      console.log('Fetching financial stats for user role:', userRole);
      
      // Get current month date for reconciliations filter
      const currentDate = new Date();
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // Build financial records query
      let financialQuery = supabase.from('financial_records').select('*');
      
      // Apply congregation filters based on user role
      if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          financialQuery = financialQuery.in('congregation_id', assignedCongregationIds);
        }
      } else if (userRole !== 'admin') {
        // For non-admin, non-pastor users, filter by headquarters (Sede)
        const { data: headquarters } = await supabase
          .from('congregations')
          .select('id')
          .eq('name', 'Sede')
          .maybeSingle();
        
        if (headquarters?.id) {
          financialQuery = financialQuery.eq('congregation_id', headquarters.id);
        }
      }

      const { data: records, error: financialError } = await financialQuery;

      if (financialError) {
        console.error('Error fetching financial records:', financialError);
        throw financialError;
      }

      // Build reconciliations query
      let reconciliationsQuery = supabase
        .from('reconciliations')
        .select('total_income, month')
        .eq('status', 'approved')
        .gte('month', currentMonthStart.toISOString().split('T')[0])
        .lt('month', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString().split('T')[0]);

      // Apply same congregation filters for reconciliations
      if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          reconciliationsQuery = reconciliationsQuery.in('congregation_id', assignedCongregationIds);
        }
      }

      const { data: reconciliations, error: reconciliationsError } = await reconciliationsQuery;

      if (reconciliationsError) {
        console.error('Error fetching reconciliations:', reconciliationsError);
        throw reconciliationsError;
      }

      console.log('Financial records fetched:', records?.length || 0, 'records');
      console.log('Approved reconciliations fetched:', reconciliations?.length || 0, 'reconciliations');

      if (!records || records.length === 0) {
        const reconciliationIncome = reconciliations?.reduce((sum, rec) => sum + Number(rec.total_income || 0), 0) || 0;
        return {
          totalIncome: reconciliationIncome,
          totalExpense: 0,
          balance: reconciliationIncome,
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

      const financialIncome = thisMonthRecords
        .filter(record => record.type === 'income')
        .reduce((sum, record) => sum + Number(record.amount), 0);

      const totalExpense = thisMonthRecords
        .filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Add approved reconciliations income to total income
      const reconciliationIncome = reconciliations?.reduce((sum, rec) => sum + Number(rec.total_income || 0), 0) || 0;
      const totalIncome = financialIncome + reconciliationIncome;

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
        financialIncome,
        reconciliationIncome,
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
    enabled: !!userRole,
  });
};
