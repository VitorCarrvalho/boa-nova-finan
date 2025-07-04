
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Reconciliation = Database['public']['Tables']['reconciliations']['Row'];
type ReconciliationInsert = Database['public']['Tables']['reconciliations']['Insert'];
type ReconciliationUpdate = Database['public']['Tables']['reconciliations']['Update'];

export const useReconciliations = () => {
  return useQuery({
    queryKey: ['reconciliations'],
    queryFn: async () => {
      console.log('Fetching reconciliations...');
      
      const { data, error } = await supabase
        .from('reconciliations')
        .select(`
          *,
          congregations (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reconciliations:', error);
        throw error;
      }

      console.log('Reconciliations fetched successfully:', data);
      return data as (Reconciliation & { congregations?: { name: string } })[];
    },
  });
};

export const useCreateReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reconciliationData: ReconciliationInsert) => {
      console.log('Creating reconciliation with data:', reconciliationData);
      
      const { data, error } = await supabase
        .from('reconciliations')
        .insert(reconciliationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating reconciliation:', error);
        throw error;
      }
      
      console.log('Reconciliation created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      toast({
        title: 'Conciliação criada',
        description: 'A conciliação foi criada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating reconciliation:', error);
      toast({
        title: 'Erro ao criar conciliação',
        description: 'Ocorreu um erro ao criar a conciliação.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: ReconciliationUpdate & { id: string }) => {
      console.log('Updating reconciliation:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('reconciliations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reconciliation:', error);
        throw error;
      }
      
      console.log('Reconciliation updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      toast({
        title: 'Conciliação atualizada',
        description: 'A conciliação foi atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating reconciliation:', error);
      toast({
        title: 'Erro ao atualizar conciliação',
        description: 'Ocorreu um erro ao atualizar a conciliação.',
        variant: 'destructive',
      });
    },
  });
};
