
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiresCongregationAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  requiresCongregationAccess = false 
}) => {
  const { user, userRole, loading } = useAuth();
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

  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar acesso específico para congregações e conciliações
  if (requiresCongregationAccess) {
    const congregationRoutes = ['/congregacoes', '/conciliacoes'];
    const isRestrictedRoute = congregationRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isRestrictedRoute) {
      // Finance e worker não têm acesso
      if (userRole === 'finance' || userRole === 'worker') {
        return <Navigate to="/dashboard" replace />;
      }

      // Admin e superadmin sempre têm acesso
      if (userRole === 'admin' || userRole === 'superadmin') {
        return <>{children}</>;
      }

      // Para pastores, verificar se têm acesso a congregações
      if (userRole === 'pastor') {
        if (!congregationAccess?.hasAccess) {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
