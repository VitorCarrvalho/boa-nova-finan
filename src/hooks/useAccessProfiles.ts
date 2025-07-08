
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  is_system_profile: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useAccessProfiles = () => {
  return useQuery({
    queryKey: ['access-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as AccessProfile[];
    },
  });
};

export const useCreateAccessProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profile: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('access_profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      return data as AccessProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-profiles'] });
      toast({
        title: "Sucesso",
        description: "Perfil de acesso criado com sucesso!",
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

export const useUpdateAccessProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('access_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AccessProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-profiles'] });
      toast({
        title: "Sucesso",
        description: "Perfil de acesso atualizado com sucesso!",
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

export const useDeleteAccessProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('access_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-profiles'] });
      toast({
        title: "Sucesso",
        description: "Perfil de acesso excluído com sucesso!",
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
