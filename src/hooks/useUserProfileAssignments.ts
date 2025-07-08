
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

export const useUserProfileAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ['user-profile-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_profile_assignments' as any)
        .select(`
          *,
          access_profiles!profile_id (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []) as unknown as UserProfileAssignment[];
    },
    enabled: !!userId,
  });
};

export const useAssignUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      const { data, error } = await supabase
        .from('user_profile_assignments' as any)
        .insert([{ user_id: userId, profile_id: profileId }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as UserProfileAssignment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments', variables.userId] });
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
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      const { error } = await supabase
        .from('user_profile_assignments' as any)
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', profileId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments', variables.userId] });
      toast({
        title: "Sucesso",
        description: "Perfil removido com sucesso!",
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
