
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

export interface UserProfileAssignment {
  id: string;
  user_id: string;
  profile_id: string;
  assigned_by: string;
  assigned_at: string;
}

export const useSystemUsers = () => {
  return useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role
        `)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUserProfileAssignments = () => {
  return useQuery({
    queryKey: ['user-profile-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile_assignments')
        .select(`
          *,
          profiles!user_profile_assignments_user_id_fkey(name, email),
          access_profiles!user_profile_assignments_profile_id_fkey(name)
        `);

      if (error) throw error;
      return data || [];
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
          profile_id: profileId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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

export const useRemoveProfileFromUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('user_profile_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile-assignments'] });
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
