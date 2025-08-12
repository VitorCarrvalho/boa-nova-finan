
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCongregationAccess = () => {
  const { user, userAccessProfile } = useAuth();

  return useQuery({
    queryKey: ['userCongregationAccess', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hasAccess: false, assignedCongregations: [] };

      // Admins sempre têm acesso
      if (userAccessProfile === 'Admin') {
        return { hasAccess: true, assignedCongregations: [] };
      }

      // Analistas e outros perfis financeiros não têm acesso
      if (userAccessProfile === 'Analista' || userAccessProfile === 'Gerente Financeiro') {
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Para pastores, verificar se estão atribuídos a alguma congregação
      if (userAccessProfile === 'Pastor') {
        // Primeiro verificar se o usuário tem um perfil de membro correspondente
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (!profile?.email) {
          console.log('Pastor não possui email no perfil');
          return { hasAccess: false, assignedCongregations: [] };
        }

        // Verificar se existe um membro correspondente com role de pastor
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('email', profile.email)
          .eq('role', 'pastor')
          .eq('is_active', true)
          .maybeSingle();

        if (!member) {
          console.log('Pastor não possui perfil de membro correspondente ou não está ativo');
          return { hasAccess: false, assignedCongregations: [] };
        }

        // Verificar congregações atribuídas ao pastor
        const { data: congregations, error } = await supabase
          .from('congregations')
          .select('id, name, responsible_pastor_ids')
          .contains('responsible_pastor_ids', [user.id]);

        if (error) {
          console.error('Erro ao verificar congregações do pastor:', error);
          return { hasAccess: false, assignedCongregations: [] };
        }

        const hasAccess = congregations && congregations.length > 0;
        console.log('Pastor access check:', { hasAccess, congregations: congregations?.length || 0 });
        
        return { 
          hasAccess, 
          assignedCongregations: congregations || [] 
        };
      }

      return { hasAccess: false, assignedCongregations: [] };
    },
    enabled: !!user?.id && !!userAccessProfile,
  });
};
