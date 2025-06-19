
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Ministry = Database['public']['Tables']['ministries']['Row'];
type MinistryInsert = Database['public']['Tables']['ministries']['Insert'];
type MinistryUpdate = Database['public']['Tables']['ministries']['Update'];

export const useMinistries = () => {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      console.log('Fetching ministries...');
      
      // First get ministries
      const { data: ministries, error: ministriesError } = await supabase
        .from('ministries')
        .select('*')
        .order('name');

      if (ministriesError) {
        console.error('Error fetching ministries:', ministriesError);
        throw ministriesError;
      }

      // Then get profiles separately to avoid foreign key issues
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Don't throw here, just continue without leader names
      }

      // Manually join the data
      const ministriesWithLeaders = ministries?.map(ministry => ({
        ...ministry,
        leader: ministry.leader_id && profiles 
          ? profiles.find(p => p.id === ministry.leader_id) 
          : undefined
      })) || [];

      console.log('Ministries fetched successfully:', ministriesWithLeaders);
      return ministriesWithLeaders as (Ministry & { leader?: { name: string } })[];
    },
  });
};

export const useCreateMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ministryData: MinistryInsert) => {
      console.log('Creating ministry with data:', ministryData);
      
      const { data, error } = await supabase
        .from('ministries')
        .insert(ministryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating ministry:', error);
        throw error;
      }
      
      console.log('Ministry created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({
        title: 'Ministério criado',
        description: 'O ministério foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating ministry:', error);
      toast({
        title: 'Erro ao criar ministério',
        description: 'Ocorreu um erro ao criar o ministério.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: MinistryUpdate & { id: string }) => {
      console.log('Updating ministry:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('ministries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ministry:', error);
        throw error;
      }
      
      console.log('Ministry updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({
        title: 'Ministério atualizado',
        description: 'O ministério foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating ministry:', error);
      toast({
        title: 'Erro ao atualizar ministério',
        description: 'Ocorreu um erro ao atualizar o ministério.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting ministry:', id);
      
      const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ministry:', error);
        throw error;
      }
      
      console.log('Ministry deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({
        title: 'Ministério excluído',
        description: 'O ministério foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting ministry:', error);
      toast({
        title: 'Erro ao excluir ministério',
        description: 'Ocorreu um erro ao excluir o ministério.',
        variant: 'destructive',
      });
    },
  });
};
