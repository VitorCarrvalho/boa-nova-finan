
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfileAssignment {
  id: string;
  user_id: string;
  profile_id: string;
  assigned_by: string;
  assigned_at: string;
  profile: {
    id: string;
    name: string;
    description: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string | null;
  };
}

export interface SystemUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  created_at: string;
}

export const useSystemUsers = () => {
  return useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as SystemUser[];
    },
  });
};

export const useUserProfileAssignments = () => {
  return useQuery({
    queryKey: ['user-profile-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile_assignments' as any)
        .select(`
          *,
          profile:access_profiles(id, name, description),
          user:profiles(id, name, email)
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
    mutationFn: async ({ 
      userId, 
      profileId 
    }: { 
      userId: string; 
      profileId: string; 
    }) => {
      const { error } = await supabase
        .from('user_profile_assignments' as any)
        .insert([{
          user_id: userId,
          profile_id: profileId
        }]);

      if (error) throw error;
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
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('user_profile_assignments' as any)
        .delete()
        .eq('id', assignmentId);

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
