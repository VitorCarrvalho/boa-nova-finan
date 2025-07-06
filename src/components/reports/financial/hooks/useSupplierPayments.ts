
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { SupplierPayment } from '../types/SupplierPaymentTypes';

export const useSupplierPayments = () => {
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
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
};
