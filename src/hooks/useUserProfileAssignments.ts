
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfileAssignment {
  id: string;
  user_id: string;
  profile_id: string;
  assigned_by: string;
  assigned_at: string;
}

export const useUserProfileAssignments = () => {
  return useQuery({
    queryKey: ['user-profile-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile_assignments' as any)
        .select(`
          *,
          profiles!user_profile_assignments_user_id_fkey (
            id,
            name,
            email
          ),
          access_profiles!user_profile_assignments_profile_id_fkey (
            id,
            name,
            description
          )
        `);

      if (error) throw error;
      return (data || []) as UserProfileAssignment[];
    },
  });
};

export const useAssignUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: { user_id: string; profile_id: string }) => {
      const { data, error } = await supabase
        .from('user_profile_assignments' as any)
        .insert([assignment])
        .select()
        .single();

      if (error) throw error;
      return data as UserProfileAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments'] });
      toast({
        title: "Sucesso",
        description: "Perfil atribuído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_profile_assignments' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments'] });
      toast({
        title: "Sucesso",
        description: "Atribuição de perfil removida com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
