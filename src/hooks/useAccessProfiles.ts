import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccessProfile {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccessProfiles = () => {
  return useQuery({
    queryKey: ['accessProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as AccessProfile[];
    },
  });
};

export const useCreateAccessProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profile: {
      name: string;
      description?: string;
      permissions: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('access_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessProfiles'] });
      toast({
        title: "Perfil criado",
        description: "O perfil foi criado com sucesso!",
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
    mutationFn: async (params: {
      id: string;
      updates: {
        name?: string;
        description?: string;
        permissions?: Record<string, any>;
      };
    }) => {
      const { data, error } = await supabase
        .from('access_profiles')
        .update(params.updates)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessProfiles'] });
      toast({
        title: "Perfil atualizado",
        description: "O perfil foi atualizado com sucesso!",
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
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessProfiles'] });
      toast({
        title: "Perfil removido",
        description: "O perfil foi removido com sucesso!",
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