
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresCongregationAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresCongregationAccess = false 
}) => {
  const { user, userAccessProfile, loading } = useAuth();
  const { data: congregationAccess, isLoading: congregationLoading } = useUserCongregationAccess();
  const location = useLocation();

  if (loading || (requiresCongregationAccess && congregationLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is approved - se não tem userAccessProfile válido, pode estar pendente
  if (!userAccessProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Seu cadastro está em análise</h2>
          <p className="text-muted-foreground mb-4">
            Aguarde aprovação para acessar o sistema.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            variant="outline"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  // Verificar acesso específico para congregações e conciliações
  if (requiresCongregationAccess) {
    const congregationRoutes = ['/congregacoes', '/conciliacoes'];
    const isRestrictedRoute = congregationRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isRestrictedRoute) {
      // Analistas e perfis financeiros não têm acesso
      if (userAccessProfile === 'Analista' || userAccessProfile === 'Gerente Financeiro') {
        return <Navigate to="/dashboard" replace />;
      }

      // Admin sempre têm acesso
      if (userAccessProfile === 'Admin') {
        return <>{children}</>;
      }

      // Para pastores, verificar se têm acesso a congregações
      if (userAccessProfile === 'Pastor') {
        if (!congregationAccess?.hasAccess) {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
