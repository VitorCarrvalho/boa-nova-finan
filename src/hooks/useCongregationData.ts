import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useTenant } from '@/contexts/TenantContext';

type Congregation = Database['public']['Tables']['congregations']['Row'];
type CongregationInsert = Database['public']['Tables']['congregations']['Insert'];
type CongregationUpdate = Database['public']['Tables']['congregations']['Update'];

export const useCongregations = () => {
  return useQuery({
    queryKey: ['congregations'],
    queryFn: async () => {
      console.log('Fetching congregations...');
      
      const { data, error } = await supabase
        .from('congregations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching congregations:', error);
        throw error;
      }

      console.log('Congregations fetched successfully:', data);
      return data as Congregation[];
    },
  });
};

export const useCreateCongregation = () => {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation({
    mutationFn: async (congregationData: CongregationInsert) => {
      console.log('Creating congregation with data:', congregationData);
      
      // Include tenant_id if available
      const dataWithTenant = tenant?.id 
        ? { ...congregationData, tenant_id: tenant.id }
        : congregationData;
      
      const { data, error } = await supabase
        .from('congregations')
        .insert(dataWithTenant)
        .select()
        .single();

      if (error) {
        console.error('Error creating congregation:', error);
        throw error;
      }
      
      console.log('Congregation created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['congregations'] });
      toast({
        title: 'Congregação criada',
        description: 'A congregação foi criada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating congregation:', error);
      toast({
        title: 'Erro ao criar congregação',
        description: 'Ocorreu um erro ao criar a congregação.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCongregation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: CongregationUpdate & { id: string }) => {
      console.log('Updating congregation:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('congregations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating congregation:', error);
        throw error;
      }
      
      console.log('Congregation updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['congregations'] });
      toast({
        title: 'Congregação atualizada',
        description: 'A congregação foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating congregation:', error);
      toast({
        title: 'Erro ao atualizar congregação',
        description: 'Ocorreu um erro ao atualizar a congregação.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCongregation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting congregation:', id);
      
      const { error } = await supabase
        .from('congregations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting congregation:', error);
        throw error;
      }
      
      console.log('Congregation deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['congregations'] });
      toast({
        title: 'Congregação excluída',
        description: 'A congregação foi excluída com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting congregation:', error);
      toast({
        title: 'Erro ao excluir congregação',
        description: 'Ocorreu um erro ao excluir a congregação.',
        variant: 'destructive',
      });
    },
  });
};
