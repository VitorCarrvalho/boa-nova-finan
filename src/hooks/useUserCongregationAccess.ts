
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserCongregationAccess = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['userCongregationAccess', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hasAccess: false, assignedCongregations: [] };

      // Admins e superadmins sempre têm acesso
      if (userRole === 'admin' || userRole === 'superadmin') {
        return { hasAccess: true, assignedCongregations: [] };
      }

      // Finance e worker não têm acesso
      if (userRole === 'finance' || userRole === 'worker') {
        return { hasAccess: false, assignedCongregations: [] };
      }

      // Para pastores, verificar se estão atribuídos a alguma congregação
      if (userRole === 'pastor') {
        const { data: congregations, error } = await supabase
          .from('congregations')
          .select('id, name, responsible_pastor_ids')
          .contains('responsible_pastor_ids', [user.id]);

        if (error) {
          console.error('Erro ao verificar congregações do pastor:', error);
          return { hasAccess: false, assignedCongregations: [] };
        }

        const hasAccess = congregations && congregations.length > 0;
        return { 
          hasAccess, 
          assignedCongregations: congregations || [] 
        };
      }

      return { hasAccess: false, assignedCongregations: [] };
    },
    enabled: !!user?.id && !!userRole,
  });
};
