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
      
      // Use RPC to get only tenant-scoped pending profiles
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_tenant_profiles', { _status: 'em_analise' });

      if (profilesError) {
        console.error('Error fetching pending users:', profilesError);
        throw profilesError;
      }

      // Fetch congregations for joins
      const congIds = (profilesData || []).map((p: any) => p.congregation_id).filter(Boolean);
      let congMap: Record<string, any> = {};
      if (congIds.length > 0) {
        const { data: congData } = await supabase.from('congregations').select('*').in('id', congIds);
        congData?.forEach((c: any) => { congMap[c.id] = c; });
      }

      const result = (profilesData || []).map((p: any) => ({
        ...p,
        congregation: p.congregation_id ? congMap[p.congregation_id] || null : null,
      }));

      console.log('Pending users fetched:', result);
      return result as PendingUserWithCongregation[];
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      profileId: string;
      congregationId?: string;
      ministries?: string[];
    }) => {
      const { data, error } = await supabase.rpc('approve_user', {
        _user_id: params.userId,
        _profile_id: params.profileId,
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
        title: "✅ Usuário aprovado",
        description: "O usuário foi aprovado com sucesso! Um email de boas-vindas foi enviado com as informações de acesso.",
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
      allowReapply?: boolean;
    }) => {
      const { data, error } = await supabase.rpc('reject_user', {
        _user_id: params.userId,
        _rejection_reason: params.rejectionReason || null,
        _allow_reapply: params.allowReapply || false,
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