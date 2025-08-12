
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';

export const useReconciliationStats = () => {
  const { userAccessProfile } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['reconciliation-stats', userAccessProfile, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      console.log('Fetching reconciliation stats for user access profile:', userAccessProfile);
      
      let query = supabase
        .from('reconciliations')
        .select('*');

      // Filter for pastors to only their assigned congregations
      if (userAccessProfile === 'Pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          query = query.in('congregation_id', assignedCongregationIds);
        } else {
          return {
            approvedThisMonth: 0,
            pendingThisMonth: 0,
            totalApprovedAmount: 0,
            totalPendingAmount: 0
          };
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reconciliation stats:', error);
        throw error;
      }

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthRecords = data.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
      });

      const approvedThisMonth = thisMonthRecords.filter(r => r.status === 'approved').length;
      const pendingThisMonth = thisMonthRecords.filter(r => r.status === 'pending').length;
      
      const totalApprovedAmount = thisMonthRecords
        .filter(r => r.status === 'approved')
        .reduce((sum, record) => sum + Number(record.total_income || 0), 0);
      
      const totalPendingAmount = thisMonthRecords
        .filter(r => r.status === 'pending')
        .reduce((sum, record) => sum + Number(record.total_income || 0), 0);

      console.log('Reconciliation stats fetched successfully:', {
        approvedThisMonth,
        pendingThisMonth,
        totalApprovedAmount,
        totalPendingAmount
      });

      return {
        approvedThisMonth,
        pendingThisMonth,
        totalApprovedAmount,
        totalPendingAmount
      };
    },
    enabled: !!userAccessProfile,
  });
};
