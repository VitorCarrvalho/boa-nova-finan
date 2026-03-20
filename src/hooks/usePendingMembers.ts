import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePendingMembers = () => {
  const { userAccessProfile } = useAuth();

  return useQuery({
    queryKey: ['pending-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userAccessProfile && (userAccessProfile === 'Admin' || userAccessProfile === 'Pastor'),
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('members')
        .update({ approval_status: 'approved', is_active: true })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-members'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
      toast({ title: 'Membro aprovado', description: 'O membro foi aprovado e está ativo.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao aprovar', description: error.message, variant: 'destructive' });
    },
  });
};

export const useRejectMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
      toast({ title: 'Cadastro rejeitado', description: 'O cadastro do membro foi removido.' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao rejeitar', description: error.message, variant: 'destructive' });
    },
  });
};
