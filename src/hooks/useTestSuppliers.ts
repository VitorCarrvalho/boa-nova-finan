import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTestSuppliers = () => {
  return useQuery({
    queryKey: ['test-suppliers'],
    queryFn: async () => {
      console.log('🔍 Testing suppliers query...');
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, email, document')
        .order('name');

      if (error) {
        console.error('❌ Error fetching suppliers:', error);
        throw error;
      }

      console.log('✅ Suppliers fetched successfully:', data);
      return data;
    },
  });
};