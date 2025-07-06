import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';

type Member = Database['public']['Tables']['members']['Row'];
type MemberInsert = Database['public']['Tables']['members']['Insert'];
type MemberUpdate = Database['public']['Tables']['members']['Update'];

export const useMembers = () => {
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['members', userRole, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      // Filter for pastors to only their assigned congregations
      if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          query = query.in('congregation_id', assignedCongregationIds);
        } else {
          // If pastor has no assigned congregations, return empty array
          return [];
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!userRole,
  });
};

export const useMemberStats = () => {
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  return useQuery({
    queryKey: ['member-stats', userRole, congregationAccess?.assignedCongregations],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*');

      // Filter for pastors to only their assigned congregations
      if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
        const assignedCongregationIds = congregationAccess.assignedCongregations.map(c => c.id);
        if (assignedCongregationIds.length > 0) {
          query = query.in('congregation_id', assignedCongregationIds);
        } else {
          // If pastor has no assigned congregations, return empty stats
          return {
            totalMembers: 0,
            activeMembers: 0,
            inactiveMembers: 0,
            pastors: 0,
            workers: 0,
            regularMembers: 0,
            ministryStats: {}
          };
        }
      }

      const { data: members, error } = await query;

      if (error) throw error;

      const activeMembers = members.filter(member => member.is_active).length;
      const inactiveMembers = members.filter(member => !member.is_active).length;
      const pastors = members.filter(member => member.role === 'pastor').length;
      const workers = members.filter(member => member.role === 'worker').length;
      const regularMembers = members.filter(member => member.role === 'member').length;

      // Estatísticas por ministério
      const ministryStats = members.reduce((acc: any, member) => {
        if (member.ministries) {
          member.ministries.forEach(ministry => {
            if (!acc[ministry]) {
              acc[ministry] = 0;
            }
            acc[ministry]++;
          });
        }
        return acc;
      }, {});

      return {
        totalMembers: members.length,
        activeMembers,
        inactiveMembers,
        pastors,
        workers,
        regularMembers,
        ministryStats
      };
    },
    enabled: !!userRole,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (memberData: MemberInsert) => {
      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
      toast({
        title: "Membro cadastrado",
        description: "O membro foi cadastrado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...memberData }: MemberUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
      toast({
        title: "Membro atualizado",
        description: "Os dados do membro foram atualizados com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
