
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
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

// Função para limpar estado de autenticação completa
const cleanupAuthState = () => {
  console.log('🧹 Limpando estado de autenticação completo...');
  
  try {
    // Remove ALL auth-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase') || key.includes('sb-') || 
          key.includes('auth') || key.includes('session') ||
          key.includes('token') || key.includes('user')) {
        console.log('🗑️ Removendo localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if it exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase') || key.includes('sb-') || 
            key.includes('auth') || key.includes('session') ||
            key.includes('token') || key.includes('user')) {
          console.log('🗑️ Removendo sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('✅ Limpeza de cache concluída');
  } catch (error) {
    console.error('❌ Erro na limpeza de cache:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, Record<string, boolean>> | null>(null);
  const [userAccessProfile, setUserAccessProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Flag para evitar race conditions
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  const fetchUserPermissions = async (userId: string, retryCount: number = 0): Promise<void> => {
    const maxRetries = 3;
    
    try {
      console.log(`📋 AuthProvider - Fetching user permissions for: ${userId} (attempt ${retryCount + 1})`);
      
      // Aguardar um pouco em retries para evitar race conditions
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
      
      // Force clear any potential cache before fetching
      await supabase.auth.getSession();
      
      // Use the same query structure that works in SQL
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, 
          approval_status,
          profile_id,
          access_profiles!left (
            name,
            permissions,
            is_active
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      console.log('🔍 AuthProvider - Raw profile query result:', { 
        profile, 
        profileError,
        userId,
        profileExists: !!profile,
        approvalStatus: profile?.approval_status,
        profileId: profile?.profile_id,
        accessProfilesData: profile?.access_profiles
      });

      if (profileError) {
        console.error(`❌ AuthProvider - Error fetching profile (attempt ${retryCount + 1}):`, profileError);
        
        // Retry em caso de erro, mas não em casos de usuário não encontrado
        if (retryCount < maxRetries && !profileError.message?.includes('No rows returned')) {
          console.log(`🔄 AuthProvider - Retrying fetchUserPermissions (${retryCount + 1}/${maxRetries})`);
          return await fetchUserPermissions(userId, retryCount + 1);
        }
        
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      if (!profile) {
        console.log(`⚠️ AuthProvider - No profile found for user: ${userId} (attempt ${retryCount + 1})`);
        
        // Retry se não encontrou o perfil, pode ser race condition
        if (retryCount < maxRetries) {
          console.log(`🔄 AuthProvider - Retrying fetchUserPermissions for missing profile (${retryCount + 1}/${maxRetries})`);
          return await fetchUserPermissions(userId, retryCount + 1);
        }
        
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      // Check approval status first
      if (profile.approval_status !== 'ativo') {
        console.log('⚠️ AuthProvider - User not active, status:', profile.approval_status);
        
        // Se o status mudou durante uso, forçar logout
        if (profile.approval_status === 'em_analise') {
          console.log('🚪 AuthProvider - Status changed to em_analise, signing out');
          await supabase.auth.signOut();
          return;
        }
        
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      // Handle access_profiles data (can be array or single object)
      let accessProfile = profile.access_profiles;
      if (Array.isArray(accessProfile)) {
        accessProfile = accessProfile[0];
      }

      console.log('🔍 AuthProvider - Access profile data:', {
        accessProfile,
        isActive: accessProfile?.is_active,
        name: accessProfile?.name,
        hasPermissions: !!accessProfile?.permissions
      });

      if (!accessProfile || !accessProfile.is_active) {
        console.log('⚠️ AuthProvider - No active access profile found');
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      const permissions = accessProfile.permissions || {};
      const profileName = accessProfile.name;

      console.log('✅ AuthProvider - User permissions loaded successfully:', { 
        profileName, 
        hasPermissions: Object.keys(permissions).length > 0,
        permissionKeys: Object.keys(permissions),
        permissions: permissions 
      });

      setUserPermissions(permissions as Record<string, Record<string, boolean>>);
      setUserAccessProfile(profileName || null);
      
    } catch (error) {
      console.error(`💥 AuthProvider - Exception loading permissions (attempt ${retryCount + 1}):`, error);
      
      // Retry em caso de exceção
      if (retryCount < maxRetries) {
        console.log(`🔄 AuthProvider - Retrying fetchUserPermissions after exception (${retryCount + 1}/${maxRetries})`);
        return await fetchUserPermissions(userId, retryCount + 1);
      }
      
      console.error('💥 Stack:', error);
      setUserPermissions({});
      setUserAccessProfile(null);
    }
  };

  // Função centralizada para processar autenticação
  const processUserAuthentication = async (currentSession: Session | null, source: string) => {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] AuthProvider - Processing auth from ${source}`, {
      hasSession: !!currentSession,
      userEmail: currentSession?.user?.email,
      isProcessing: isProcessingAuth
    });

    // Evitar processamento simultâneo
    if (isProcessingAuth) {
      console.log(`⚠️ [${timestamp}] AuthProvider - Already processing, skipping ${source}`);
      return;
    }

    setIsProcessingAuth(true);
    
    try {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log(`👤 [${timestamp}] AuthProvider - User found from ${source}, loading permissions...`);
        await fetchUserPermissions(currentSession.user.id);
      } else {
        console.log(`🚪 [${timestamp}] AuthProvider - No user from ${source}, clearing state`);
        setUserPermissions({});
        setUserAccessProfile(null);
      }
    } catch (error) {
      console.error(`💥 [${timestamp}] AuthProvider - Error processing ${source}:`, error);
      setUserPermissions({});
      setUserAccessProfile(null);
    } finally {
      setIsProcessingAuth(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider - Setting up AuthProvider...');
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a maximum loading time of 10 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⏰ AuthProvider - Loading timeout - forcing completion');
        setLoading(false);
        setIsProcessingAuth(false);
      }
    }, 10000);
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const timestamp = new Date().toISOString();
        console.log(`🔐 [${timestamp}] AuthProvider - Auth state change:`, {
          event,
          userEmail: session?.user?.email,
          isProcessing: isProcessingAuth
        });
        
        if (!isMounted) return;
        
        // Usar a função centralizada
        await processUserAuthentication(session, `onAuthStateChange(${event})`);
        clearTimeout(timeoutId);
      }
    );

    // Verificar sessão existente apenas uma vez na inicialização
    const checkSession = async () => {
      try {
        const timestamp = new Date().toISOString();
        console.log(`🔍 [${timestamp}] AuthProvider - Checking existing session...`);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error(`❌ [${timestamp}] AuthProvider - Error checking session:`, error);
          cleanupAuthState();
          if (isMounted) {
            setLoading(false);
            setIsProcessingAuth(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        console.log(`📋 [${timestamp}] AuthProvider - Existing session:`, {
          hasSession: !!session,
          userEmail: session?.user?.email
        });
        
        if (!isMounted) return;
        
        // Usar a função centralizada
        await processUserAuthentication(session, 'checkSession');
        clearTimeout(timeoutId);
        
      } catch (err) {
        const timestamp = new Date().toISOString();
        console.error(`💥 [${timestamp}] AuthProvider - General exception checking session:`, err);
        cleanupAuthState();
        if (isMounted) {
          setLoading(false);
          setIsProcessingAuth(false);
        }
        clearTimeout(timeoutId);
      }
    };

    // Aguardar um pouco antes de verificar a sessão para evitar race condition
    setTimeout(() => {
      if (isMounted) {
        checkSession();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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
      console.log('🔑 Iniciando login para:', email);
      
      // Limpar estado completo antes do login
      cleanupAuthState();
      
      // Force sign out any existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('🔄 Ignoring sign out error:', err);
      }
      
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('❌ Erro no login:', error);
        return { error };
      }
      
      // Check user approval status after successful login
      if (data.user) {
        console.log('✅ Login bem-sucedido, verificando status do usuário...');
        
        // Use a more reliable query without nested joins
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('approval_status')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.log('❌ Erro ao verificar status:', profileError);
          // Don't fail login for this - let the auth flow handle it
          console.log('⚠️ Continuando login apesar do erro de verificação');
        } else if (profile) {
          console.log('📊 Status do usuário:', profile.approval_status);
          
          if (profile.approval_status === 'em_analise') {
            // Sign out the user immediately
            await supabase.auth.signOut();
            return { 
              error: { 
                message: 'Seu cadastro está em análise. Aguarde aprovação para acessar o sistema.' 
              } 
            };
          } else if (profile.approval_status === 'rejeitado') {
            // Sign out the user immediately
            await supabase.auth.signOut();
            return { 
              error: { 
                message: 'Seu cadastro foi rejeitado. Entre em contato com o administrador.' 
              } 
            };
          }
        }
      }
      
      console.log('✅ Login realizado com sucesso - deixando AuthPage fazer redirect');
      return { error: null };
      
    } catch (err) {
      console.log('💥 Erro inesperado no login:', err);
      return { error: err };
    } finally {
      // CRITICAL: Always clear loading state
      console.log('🏁 Finalizando processo de login - clearing loading');
      setLoading(false);
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
