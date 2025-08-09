
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  userPermissions: Record<string, Record<string, boolean>> | null;
  userAccessProfile: string | null;
  hasPermission: (module: string, action?: string) => boolean;
  hasNestedPermission: (path: string) => boolean;
  getUserAccessProfile: () => string | null;
  signUp: (email: string, password: string, name: string, congregationId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Função para limpar estado de autenticação
const cleanupAuthState = () => {
  console.log('Limpando estado de autenticação...');
  
  // Remove tokens do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove tokens do sessionStorage se existir
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, Record<string, boolean>> | null>(null);
  const [userAccessProfile, setUserAccessProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar permissões com retry automático
  const fetchUserPermissionsWithRetry = async (userId: string, userEmail?: string, retryCount: number = 0): Promise<void> => {
    const maxRetries = 3;
    const isDebugUser = userEmail === 'robribeir20@gmail.com' || userEmail === 'contato@leonardosale.com';
    
    if (isDebugUser) {
      console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Tentativa ${retryCount + 1} de buscar permissões`);
    }
    
    try {
      // Primeira tentativa: query direta mais simples
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('access_profiles(permissions)')
        .eq('id', userId)
        .eq('approval_status', 'ativo')
        .single();

      if (isDebugUser) {
        console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Query direta resultado:`, { directData, directError });
      }

      if (!directError && directData?.access_profiles?.permissions) {
        const permissions = directData.access_profiles.permissions;
        
        // Validar se as permissões não estão vazias
        if (typeof permissions === 'object' && Object.keys(permissions).length > 0) {
          if (isDebugUser) {
            console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Permissões válidas encontradas:`, permissions);
          }
          setUserPermissions(permissions as Record<string, Record<string, boolean>>);
          return;
        }
      }

      // Segunda tentativa: query com inner join
      const { data: innerData, error: innerError } = await supabase
        .from('profiles')
        .select('access_profiles!inner(permissions)')
        .eq('id', userId)
        .eq('approval_status', 'ativo')
        .single();

      if (isDebugUser) {
        console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Query inner join resultado:`, { innerData, innerError });
      }

      if (!innerError && innerData?.access_profiles?.permissions) {
        const permissions = innerData.access_profiles.permissions;
        
        // Validar se as permissões não estão vazias
        if (typeof permissions === 'object' && Object.keys(permissions).length > 0) {
          if (isDebugUser) {
            console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Permissões válidas encontradas (inner):`, permissions);
          }
          setUserPermissions(permissions as Record<string, Record<string, boolean>>);
          return;
        }
      }

      // Terceira tentativa: usar função RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_permissions');
      
      if (isDebugUser) {
        console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - RPC resultado:`, { rpcData, rpcError });
      }

      if (!rpcError && rpcData && typeof rpcData === 'object' && Object.keys(rpcData).length > 0) {
        if (isDebugUser) {
          console.log(`🔍 ${userEmail?.toUpperCase()} DEBUG - Permissões válidas via RPC:`, rpcData);
        }
        setUserPermissions(rpcData as Record<string, Record<string, boolean>>);
        return;
      }

      // Se chegou aqui, algo está errado - retry se ainda temos tentativas
      if (retryCount < maxRetries) {
        console.warn(`AuthProvider - Tentativa ${retryCount + 1} falhou, tentando novamente em 1s...`);
        setTimeout(() => {
          fetchUserPermissionsWithRetry(userId, userEmail, retryCount + 1);
        }, 1000);
        return;
      }

      // Se esgotaram as tentativas, setar permissões vazias e alertar
      console.error('AuthProvider - ERRO CRÍTICO: Não foi possível carregar permissões após todas as tentativas');
      if (isDebugUser) {
        console.error(`🔍 ${userEmail?.toUpperCase()} DEBUG - FALHA CRÍTICA ao carregar permissões`);
      }
      setUserPermissions({});

    } catch (error) {
      console.error('AuthProvider - Erro ao buscar permissões:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchUserPermissionsWithRetry(userId, userEmail, retryCount + 1);
        }, 1000);
      } else {
        setUserPermissions({});
      }
    }
  };

  useEffect(() => {
    console.log('AuthProvider - Configurando AuthProvider...');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider - Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider - User authenticated, fetching role and permissions...');
          // Buscar role e permissões do usuário - usar setTimeout para evitar deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role, approval_status, access_profiles(name)')
                .eq('id', session.user.id)
                .single();
              
              console.log('AuthProvider - Profile data:', profile);
              
              if (error) {
                console.log('AuthProvider - Erro ao buscar perfil:', error);
                setUserRole('worker'); // Role padrão
                setUserPermissions(null);
              } else {
                 // Only set role if user is approved
                if (profile?.approval_status === 'ativo') {
                  console.log('AuthProvider - Setting user role from profile:', profile.role);
                  
                  // DEBUG: Logs especiais para usuários problemáticos
                  if (session.user.email === 'robribeir20@gmail.com' || session.user.email === 'contato@leonardosale.com') {
                    console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG - Profile data:`, profile);
                    console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG - Profile role:`, profile.role);
                    console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG - Approval status:`, profile.approval_status);
                  }
                  
                  // Usar get_current_user_role() para obter o role correto mapeado
                  const { data: mappedRole } = await supabase.rpc('get_current_user_role');
                  const finalRole = mappedRole ?? 'worker';
                  console.log('AuthProvider - Role mapeado pela função:', finalRole);
                  
                  // DEBUG: Logs especiais para usuários problemáticos
                  if (session.user.email === 'robribeir20@gmail.com' || session.user.email === 'contato@leonardosale.com') {
                    console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG - Role mapeado:`, finalRole);
                  }
                  
                  setUserRole(finalRole);
                  
                  // Extrair nome do perfil de acesso
                  const accessProfileName = profile?.access_profiles?.name || null;
                  console.log('AuthProvider - Access profile name:', accessProfileName);
                  setUserAccessProfile(accessProfileName);
                  
                  // Buscar permissões com retry automático
                  await fetchUserPermissionsWithRetry(session.user.id, session.user.email);
                } else {
                  console.log('AuthProvider - User not approved, setting worker role');
                  setUserRole('worker'); // Pending/rejected users get worker role (no access)
                  setUserPermissions(null);
                  setUserAccessProfile(null);
                }
              }
            } catch (err) {
              console.log('AuthProvider - Erro na busca do perfil:', err);
              setUserRole('worker');
              setUserPermissions(null);
            }
          }, 100);
        } else {
          console.log('AuthProvider - No user, clearing role and permissions');
          setUserRole(null);
          setUserPermissions(null);
          setUserAccessProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    const checkSession = async () => {
      try {
        console.log('AuthProvider - Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('AuthProvider - Erro ao verificar sessão:', error);
          cleanupAuthState();
          setLoading(false);
          return;
        }

        console.log('AuthProvider - Sessão existente:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider - Existing user found, fetching role and permissions...');
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role, approval_status, access_profiles(name)')
                .eq('id', session.user.id)
                .single();
              
              console.log('AuthProvider - Initial profile data:', profile);
              
              // Only set role if user is approved
              if (profile?.approval_status === 'ativo') {
                console.log('AuthProvider - Setting initial user role from profile:', profile.role);
                
                // DEBUG: Logs especiais para usuários problemáticos na sessão inicial
                if (session.user.email === 'robribeir20@gmail.com' || session.user.email === 'contato@leonardosale.com') {
                  console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG (Initial) - Profile data:`, profile);
                  console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG (Initial) - Profile role:`, profile.role);
                  console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG (Initial) - Approval status:`, profile.approval_status);
                }
                
                // Usar get_current_user_role() para obter o role correto mapeado
                const { data: mappedRole } = await supabase.rpc('get_current_user_role');
                const finalRole = mappedRole ?? 'worker';
                console.log('AuthProvider - Role inicial mapeado pela função:', finalRole);
                
                // DEBUG: Logs especiais para usuários problemáticos na sessão inicial
                if (session.user.email === 'robribeir20@gmail.com' || session.user.email === 'contato@leonardosale.com') {
                  console.log(`🔍 ${session.user.email.toUpperCase()} DEBUG (Initial) - Role mapeado:`, finalRole);
                }
                
                setUserRole(finalRole);
                
                // Extrair nome do perfil de acesso
                const accessProfileName = profile?.access_profiles?.name || null;
                console.log('AuthProvider - Initial access profile name:', accessProfileName);
                setUserAccessProfile(accessProfileName);
                
                // Buscar permissões com retry automático na sessão inicial
                await fetchUserPermissionsWithRetry(session.user.id, session.user.email);
              } else {
                console.log('AuthProvider - Initial user not approved, setting worker role');
                setUserRole('worker'); // Pending/rejected users get worker role (no access)
                setUserPermissions(null);
                setUserAccessProfile(null);
              }
            } catch (err) {
              console.log('AuthProvider - Erro ao buscar perfil inicial:', err);
              setUserRole('worker');
              setUserPermissions(null);
              setUserAccessProfile(null);
            }
          }, 100);
        }
        
        setLoading(false);
      } catch (err) {
        console.log('AuthProvider - Erro geral na verificação de sessão:', err);
        cleanupAuthState();
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, congregationId?: string) => {
    try {
      console.log('Iniciando cadastro para:', email);
      
      // Limpar estado antes do cadastro
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            congregation_id: congregationId
          }
        }
      });
      
      if (error) {
        console.log('Erro no cadastro:', error);
        return { error };
      }
      
      console.log('Cadastro realizado com sucesso:', data);
      return { error: null };
    } catch (err) {
      console.log('Erro inesperado no cadastro:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando login para:', email);
      
      // Limpar estado antes do login
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('Erro no login:', error);
        return { error };
      }
      
      // Check user approval status after successful login
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('approval_status, access_profiles(name)')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.log('Erro ao verificar status de aprovação:', profileError);
          return { error: profileError };
        }
        
        if (profile?.approval_status === 'em_analise') {
          // Sign out the user immediately
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Seu cadastro está em análise. Aguarde aprovação para acessar o sistema.' 
            } 
          };
        } else if (profile?.approval_status === 'rejeitado') {
          // Sign out the user immediately
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Seu cadastro foi rejeitado. Entre em contato com o administrador.' 
            } 
          };
        }
      }
      
      console.log('Login realizado com sucesso:', data);
      return { error: null };
    } catch (err) {
      console.log('Erro inesperado no login:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      
      // Limpar estado primeiro
      cleanupAuthState();
      
      // Tentar logout global
      await supabase.auth.signOut({ scope: 'global' });
      
      // Forçar refresh da página para garantir limpeza completa
      window.location.href = '/auth';
    } catch (error) {
      console.log('Erro no logout:', error);
      // Mesmo com erro, forçar refresh
      window.location.href = '/auth';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Enviando email de recuperação para:', email);
      
      // Usar URL absoluta fixa ao invés de window.location.origin
      const resetUrl = 'https://a4e9f62a-d1cb-47f7-9954-c726936cfd81.lovableproject.com/reset-password';
      console.log('URL de redirecionamento configurada:', resetUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl
      });
      
      if (error) {
        console.log('Erro no reset de senha:', error);
        
        // Tratar erros específicos de rate limiting
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          return { 
            error: { 
              ...error, 
              message: 'Muitas tentativas de reset de senha. Aguarde alguns minutos antes de tentar novamente.' 
            } 
          };
        }
        
        return { error };
      }
      
      console.log('Email de recuperação enviado com sucesso para:', resetUrl);
      return { error: null };
    } catch (err) {
      console.log('Erro inesperado no reset de senha:', err);
      return { error: err };
    }
  };

  const getUserAccessProfile = (): string | null => {
    console.log('[AuthContext] getUserAccessProfile - Current userAccessProfile:', userAccessProfile);
    console.log('[AuthContext] getUserAccessProfile - Current user:', user?.email);
    console.log('[AuthContext] getUserAccessProfile - Current userRole:', userRole);
    return userAccessProfile;
  };

  const hasPermission = (module: string, action: string = 'view'): boolean => {
    console.log(`🔍 hasPermission - Checking ${module}.${action}`, { 
      userPermissions, 
      userAccessProfile 
    });
    
    if (!userPermissions) {
      console.log('🔍 hasPermission - No userPermissions found');
      return false;
    }

    // Check specific permissions from access_profile
    const modulePermissions = userPermissions[module];
    console.log(`🔍 hasPermission - Module ${module} permissions:`, modulePermissions);
    
    if (modulePermissions && typeof modulePermissions === 'object') {
      const hasAccess = modulePermissions[action] === true;
      console.log(`🔍 hasPermission - Access result: ${hasAccess}`);
      return hasAccess;
    }

    console.log('🔍 hasPermission - No permissions found, denying access');
    return false;
  };

  // Support nested permissions (e.g., 'contas-pagar.paid_accounts.view')
  const hasNestedPermission = (path: string): boolean => {
    if (!userPermissions) return false;
    
    const keys = path.split('.');
    let current: any = userPermissions;
    
    for (let i = 0; i < keys.length; i++) {
      if (!current || typeof current !== 'object') return false;
      current = current[keys[i]];
    }
    
    return current === true;
  };

  const value = {
    user,
    session,
    userRole,
    userPermissions,
    userAccessProfile,
    hasPermission,
    hasNestedPermission,
    getUserAccessProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
