
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCongregationAccess = () => {
  const { user, userAccessProfile } = useAuth();

  return useQuery({
    queryKey: ['userCongregationAccess', user?.id, userAccessProfile],
    queryFn: async () => {
      console.log('🏛️ useUserCongregationAccess: Checking access for profile:', userAccessProfile);
      
      if (!user?.id) {
        console.log('❌ useUserCongregationAccess: No user ID');
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Retorno imediato baseado no perfil já carregado do AuthContext
      if (userAccessProfile === 'Admin') {
        console.log('✅ useUserCongregationAccess: Admin has access');
        return { hasAccess: true, assignedCongregations: [] };
      }

      if (userAccessProfile === 'Analista' || userAccessProfile === 'Gerente Financeiro') {
        console.log('🚫 useUserCongregationAccess: Profile does not have congregation access');
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Pastor precisa verificar congregações
      if (userAccessProfile === 'Pastor') {
        console.log('🔍 useUserCongregationAccess: Checking pastor congregations...');
        try {
          const { data: congregations, error } = await supabase
            .from('congregations')
            .select('id, name, responsible_pastor_ids')
            .contains('responsible_pastor_ids', [user.id]);

          if (error) {
            console.error('❌ useUserCongregationAccess: Error fetching congregations:', error);
            return { hasAccess: false, assignedCongregations: [] };
          }

          const hasAccess = congregations && congregations.length > 0;
          console.log('📊 useUserCongregationAccess: Pastor access result:', { hasAccess, count: congregations?.length });
          return { 
            hasAccess, 
            assignedCongregations: congregations || [] 
          };
        } catch (error) {
          console.error('💥 useUserCongregationAccess: Exception checking pastor:', error);
          return { hasAccess: false, assignedCongregations: [] };
        }
      }

      // Outros perfis não têm acesso
      console.log('🚫 useUserCongregationAccess: Unknown profile, no access');
      return { hasAccess: false, assignedCongregations: [] };
    },
    enabled: !!user?.id && !!userAccessProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
