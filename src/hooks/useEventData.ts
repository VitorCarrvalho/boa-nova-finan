
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'];
type ChurchEventInsert = Database['public']['Tables']['church_events']['Insert'];
type ChurchEventUpdate = Database['public']['Tables']['church_events']['Update'];

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('church_events')
        .select(`
          *,
          organizer:organizer_id(name)
        `)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data as (ChurchEvent & { organizer?: { name: string } })[];
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: ChurchEventInsert) => {
      const { data, error } = await supabase
        .from('church_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Evento criado',
        description: 'O evento foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: 'Erro ao criar evento',
        description: 'Ocorreu um erro ao criar o evento.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: ChurchEventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('church_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Evento atualizado',
        description: 'O evento foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: 'Erro ao atualizar evento',
        description: 'Ocorreu um erro ao atualizar o evento.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('church_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Evento excluído',
        description: 'O evento foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erro ao excluir evento',
        description: 'Ocorreu um erro ao excluir o evento.',
        variant: 'destructive',
      });
    },
  });
};

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      return data;
    },
  });
};
