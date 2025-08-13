import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCongregationsPublic = () => {
  return useQuery({
    queryKey: ['congregations-public'],
    queryFn: async () => {
      console.log('Fetching public congregations...');
      
      const { data, error } = await supabase
        .from('congregations_public')
        .select('id, name, city, state')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching public congregations:', error);
        throw error;
      }

      console.log('Public congregations fetched successfully:', data);
      return data;
    },
  });
};