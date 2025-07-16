import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTestPastors = () => {
  return useQuery({
    queryKey: ['test-pastors'],
    queryFn: async () => {
      console.log('🔍 Testing pastors query...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, approval_status')
        .eq('role', 'pastor')
        .eq('approval_status', 'ativo')
        .order('name');

      if (error) {
        console.error('❌ Error fetching pastors:', error);
        throw error;
      }

      console.log('✅ Pastors fetched successfully:', data);
      return data;
    },
  });
};