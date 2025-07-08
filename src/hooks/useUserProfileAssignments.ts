
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
      let query = supabase.from('user_profile_assignments').select(`
        *,
        profile:access_profiles(*)
      `);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as UserProfileAssignment[];
    },
    enabled: !userId || !!userId, // Always enabled, but filtered if userId provided
  });
};

export const useAssignProfileToUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      const { data, error } = await supabase
        .from('user_profile_assignments')
        .insert([{
          user_id: userId,
          profile_id: profileId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data as UserProfileAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments'] });
      toast({
        title: "Sucesso",
        description: "Perfil atribuído ao usuário com sucesso!",
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

export const useRemoveProfileFromUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, profileId }: { userId: string; profileId: string }) => {
      const { error } = await supabase
        .from('user_profile_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments'] });
      toast({
        title: "Sucesso",
        description: "Perfil removido do usuário com sucesso!",
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
