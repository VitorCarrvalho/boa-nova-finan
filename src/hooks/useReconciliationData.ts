import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import type { Database } from '@/integrations/supabase/types';

type Reconciliation = Database['public']['Tables']['reconciliations']['Row'];
type ReconciliationInsert = Database['public']['Tables']['reconciliations']['Insert'];
type ReconciliationUpdate = Database['public']['Tables']['reconciliations']['Update'];

export const useReconciliations = () => {
  const { userAccessProfile } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['reconciliations', userAccessProfile, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      console.log('Fetching reconciliations for user access profile:', userAccessProfile);
      
      let query = supabase
        .from('reconciliations')
        .select(`
          *,
          congregations (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Filter for pastors to only their assigned congregations
      if (userAccessProfile === 'Pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          query = query.in('congregation_id', assignedCongregationIds);
        } else {
          // If pastor has no assigned congregations, return empty array
          return [];
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reconciliations:', error);
        throw error;
      }

      console.log('Reconciliations fetched successfully:', data);
      return data as (Reconciliation & { congregations?: { name: string } })[];
    },
    enabled: !!userAccessProfile,
  });
};

export const useCreateReconciliation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reconciliationData: ReconciliationInsert) => {
      console.log('Creating reconciliation with data:', reconciliationData);
      
      // Validate required fields
      if (!reconciliationData.congregation_id) {
        throw new Error('Congregação é obrigatória');
      }
      
      if (!reconciliationData.reconciliation_date) {
        throw new Error('Data da conciliação é obrigatória');
      }
      
      // Ensure status is always pending for new reconciliations
      const dataToInsert = {
        ...reconciliationData,
        status: 'pending',
        total_income: reconciliationData.total_income || 0
      };
      
      const { data, error } = await supabase
        .from('reconciliations')
        .insert(dataToInsert)
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
        title: 'Conciliação enviada',
        description: 'A conciliação foi enviada com sucesso e está aguardando aprovação.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating reconciliation:', error);
      toast({
        title: 'Erro ao enviar conciliação',
        description: error.message || 'Ocorreu um erro ao enviar a conciliação.',
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] });
      
      // Different toast messages based on action
      if (variables.status === 'approved') {
        toast({
          title: 'Conciliação aprovada',
          description: 'A conciliação foi aprovada com sucesso.',
        });
      } else if (variables.status === 'rejected') {
        toast({
          title: 'Conciliação rejeitada',
          description: 'A conciliação foi rejeitada.',
        });
      } else {
        toast({
          title: 'Conciliação atualizada',
          description: 'A conciliação foi atualizada com sucesso.',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error updating reconciliation:', error);
      toast({
        title: 'Erro ao atualizar conciliação',
        description: error.message || 'Ocorreu um erro ao atualizar a conciliação.',
        variant: 'destructive',
      });
    },
  });
};
