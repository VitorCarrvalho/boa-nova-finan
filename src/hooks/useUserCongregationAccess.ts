
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCongregationAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userCongregationAccess', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Buscar o perfil do usuário diretamente sem depender do AuthContext
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          approval_status,
          access_profiles!inner(name)
        `)
        .eq('id', user.id)
        .eq('approval_status', 'ativo')
        .eq('access_profiles.is_active', true)
        .maybeSingle();

      const profileName = profile?.access_profiles?.name;

      // Admin sempre tem acesso
      if (profileName === 'Admin') {
        return { hasAccess: true, assignedCongregations: [] };
      }

      // Analista e Gerente Financeiro não têm acesso a congregações
      if (profileName === 'Analista' || profileName === 'Gerente Financeiro') {
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Pastor precisa verificar congregações
      if (profileName === 'Pastor') {
        try {
          const { data: congregations, error } = await supabase
            .from('congregations')
            .select('id, name, responsible_pastor_ids')
            .contains('responsible_pastor_ids', [user.id]);

          if (error) {
            console.error('Erro ao verificar congregações:', error);
            return { hasAccess: false, assignedCongregations: [] };
          }

          const hasAccess = congregations && congregations.length > 0;
          return { 
            hasAccess, 
            assignedCongregations: congregations || [] 
          };
        } catch (error) {
          console.error('Erro na verificação do Pastor:', error);
          return { hasAccess: false, assignedCongregations: [] };
        }
      }

      // Outros perfis não têm acesso
      return { hasAccess: false, assignedCongregations: [] };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
