
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCongregationAccess = () => {
  const { user, userAccessProfile } = useAuth();

  return useQuery({
    queryKey: ['userCongregationAccess', user?.id, userAccessProfile],
    queryFn: async () => {
      console.log('useUserCongregationAccess - iniciando verificação:', { userId: user?.id, profile: userAccessProfile });
      
      if (!user?.id) {
        console.log('useUserCongregationAccess - sem usuário');
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Retorno imediato para perfis que não precisam de verificação complexa
      if (userAccessProfile === 'Admin') {
        console.log('useUserCongregationAccess - Admin tem acesso total');
        return { hasAccess: true, assignedCongregations: [] };
      }

      // Analistas e outros perfis financeiros não têm acesso - retorno imediato
      if (userAccessProfile === 'Analista' || userAccessProfile === 'Gerente Financeiro') {
        console.log('useUserCongregationAccess - Perfil financeiro sem acesso a congregações');
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Para outros perfis (incluindo Membro), retorno padrão sem acesso
      if (userAccessProfile && userAccessProfile !== 'Pastor') {
        console.log('useUserCongregationAccess - Perfil sem acesso específico a congregações');
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Apenas para Pastores fazer verificação completa
      if (userAccessProfile === 'Pastor') {
        console.log('useUserCongregationAccess - Verificando acesso do Pastor');
        
        try {
          // Primeiro verificar se o usuário tem um perfil de membro correspondente
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();

          if (!profile?.email) {
            console.log('useUserCongregationAccess - Pastor não possui email no perfil');
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
            console.log('useUserCongregationAccess - Pastor não possui perfil de membro correspondente ou não está ativo');
            return { hasAccess: false, assignedCongregations: [] };
          }

          // Verificar congregações atribuídas ao pastor
          const { data: congregations, error } = await supabase
            .from('congregations')
            .select('id, name, responsible_pastor_ids')
            .contains('responsible_pastor_ids', [user.id]);

          if (error) {
            console.error('useUserCongregationAccess - Erro ao verificar congregações do pastor:', error);
            return { hasAccess: false, assignedCongregations: [] };
          }

          const hasAccess = congregations && congregations.length > 0;
          console.log('useUserCongregationAccess - Pastor access check:', { hasAccess, congregations: congregations?.length || 0 });
          
          return { 
            hasAccess, 
            assignedCongregations: congregations || [] 
          };
        } catch (error) {
          console.error('useUserCongregationAccess - Erro na verificação do Pastor:', error);
          return { hasAccess: false, assignedCongregations: [] };
        }
      }

      console.log('useUserCongregationAccess - Retorno padrão sem acesso');
      return { hasAccess: false, assignedCongregations: [] };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
