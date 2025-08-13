
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

  console.log('🛡️ ProtectedRoute:', { 
    hasUser: !!user, 
    userAccessProfile, 
    loading, 
    requiresCongregationAccess,
    congregationLoading,
    pathname: location.pathname
  });

  // Mostrar loading apenas para dados essenciais
  if (loading) {
    console.log('⏳ ProtectedRoute: Waiting for auth...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, redirecionar para login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Aguardar carregamento das permissões por mais tempo após o login
  if (!loading && user && userAccessProfile === undefined) {
    console.log('ProtectedRoute - Aguardando carregamento das permissões...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  // Só mostrar "em análise" se realmente não há perfil de acesso E não está carregando
  if (!loading && user && userAccessProfile === null) {
    console.log(`🚨 ProtectedRoute - User ${user.email || user.id} sem perfil de acesso válido, mostrando tela de análise`);
    
    const handleReload = () => {
      console.log('🔄 ProtectedRoute - Forçando recarregamento completo...');
      // Clear all auth caches and reload
      localStorage.removeItem('lovable_user_data');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-foreground">Seu cadastro está em análise</h2>
          <p className="text-muted-foreground mb-4">
            Aguarde aprovação para acessar o sistema.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleReload}
              variant="default"
            >
              Recarregar
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="outline"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar acesso específico para congregações e conciliações
  if (requiresCongregationAccess) {
    console.log('🔍 ProtectedRoute: Checking congregation access...');
    
    // Aguardar carregamento dos dados de congregação apenas quando necessário
    if (congregationLoading) {
      console.log('⏳ ProtectedRoute: Waiting for congregation data...');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Verificando acesso...</p>
          </div>
        </div>
      );
    }
    
    const congregationRoutes = ['/congregacoes', '/conciliacoes'];
    const isRestrictedRoute = congregationRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (isRestrictedRoute) {
      console.log('🚪 ProtectedRoute: Restricted route, checking permissions...');
      
      // Analistas e perfis financeiros não têm acesso
      if (userAccessProfile === 'Analista' || userAccessProfile === 'Gerente Financeiro') {
        console.log('🚫 ProtectedRoute: Access denied for profile:', userAccessProfile);
        return <Navigate to="/dashboard" replace />;
      }

      // Admin sempre têm acesso
      if (userAccessProfile === 'Admin') {
        console.log('✅ ProtectedRoute: Admin access granted');
        return <>{children}</>;
      }

      // Para pastores, verificar se têm acesso a congregações
      if (userAccessProfile === 'Pastor') {
        if (!congregationAccess?.hasAccess) {
          console.log('🚫 ProtectedRoute: Pastor without congregation access');
          return <Navigate to="/dashboard" replace />;
        }
        console.log('✅ ProtectedRoute: Pastor with congregation access');
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
