import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Congregation = Database['public']['Tables']['congregations']['Row'];

export interface PendingUserWithCongregation extends Profile {
  congregation: Congregation | null;
}

export const usePendingUsers = () => {
  return useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      console.log('Fetching pending users');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          congregation:congregation_id (*)
        `)
        .eq('approval_status', 'em_analise')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending users:', error);
        throw error;
      }

      console.log('Pending users fetched:', profiles);
      return profiles as PendingUserWithCongregation[];
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      role: Database['public']['Enums']['user_role'];
      congregationId?: string;
      ministries?: string[];
    }) => {
      const { data, error } = await supabase.rpc('approve_user', {
        _user_id: params.userId,
        _role: params.role,
        _congregation_id: params.congregationId || null,
        _ministries: params.ministries || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado com sucesso!",
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

export const useRejectUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase.rpc('reject_user', {
        _user_id: params.userId,
        _rejection_reason: params.rejectionReason || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado.",
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