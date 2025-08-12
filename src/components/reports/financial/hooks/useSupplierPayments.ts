
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { SupplierPayment } from '../types/SupplierPaymentTypes';

export const useSupplierPayments = () => {
  const { userAccessProfile } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['supplier-payments', userAccessProfile, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      let query = supabase
        .from('financial_records')
        .select(`
          id,
          amount,
          method,
          category,
          created_at,
          description,
          congregation_id,
          type,
          attendees,
          event_date,
          event_type,
          created_by,
          updated_at
        `)
        .eq('type', 'expense')
        .eq('category', 'supplier')
        .order('created_at', { ascending: false });

      // Apply user access profile filters
      if (userAccessProfile === 'Pastor' && congregationAccess?.assignedCongregations) {
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
    enabled: !!userAccessProfile,
  });
};
