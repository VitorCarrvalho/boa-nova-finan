
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfilePermission {
  id: string;
  profile_id: string;
  module: string;
  submodule: string | null;
  sub_submodule: string | null;
  action: 'view' | 'insert' | 'edit' | 'inactivate' | 'approve' | 'export' | 'send_notification';
  created_at: string;
}

export const useProfilePermissions = (profileId: string) => {
  return useQuery({
    queryKey: ['profile-permissions', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('profile_permissions' as any)
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      return data as ProfilePermission[];
    },
    enabled: !!profileId,
  });
};

export const useSaveProfilePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      profileId, 
      permissions 
    }: { 
      profileId: string; 
      permissions: Array<{
        module: string;
        submodule?: string;
        sub_submodule?: string;
        action: string;
      }>;
    }) => {
      // First, delete all existing permissions for this profile
      await supabase
        .from('profile_permissions' as any)
        .delete()
        .eq('profile_id', profileId);

      // Then insert the new permissions
      if (permissions.length > 0) {
        const { error } = await supabase
          .from('profile_permissions' as any)
          .insert(
            permissions.map(p => ({
              profile_id: profileId,
              module: p.module,
              submodule: p.submodule || null,
              sub_submodule: p.sub_submodule || null,
              action: p.action
            }))
          );

        if (error) throw error;
      }

      // Log audit entry
      await supabase
        .from('permission_audit_logs' as any)
        .insert(
          permissions.map(p => ({
            profile_id: profileId,
            module: p.module,
            submodule: p.submodule || null,
            sub_submodule: p.sub_submodule || null,
            action: p.action,
            operation: 'granted'
          }))
        );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile-permissions', variables.profileId] });
      toast({
        title: "Sucesso",
        description: "Permissões salvas com sucesso!",
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
