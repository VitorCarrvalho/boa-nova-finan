
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfileAssignment {
  id: string;
  user_id: string;
  profile_id: string;
  assigned_by: string;
  assigned_at: string;
  access_profiles: {
    name: string;
    description: string | null;
  };
}

export interface UserWithProfiles {
  id: string;
  name: string;
  email: string | null;
  role: string;
  user_profile_assignments: UserProfileAssignment[];
}

export const useUsersWithProfiles = () => {
  return useQuery({
    queryKey: ['users-with-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          user_profile_assignments (
            id,
            profile_id,
            assigned_by,
            assigned_at,
            access_profiles (
              name,
              description
            )
          )
        `)
        .order('name');

      if (error) throw error;
      return data as UserWithProfiles[];
    },
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
          profile_id: profileId
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-profiles'] });
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
      queryClient.invalidateQueries({ queryKey: ['users-with-profiles'] });
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
