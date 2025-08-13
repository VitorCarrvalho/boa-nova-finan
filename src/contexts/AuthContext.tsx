
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

  // Auto-healing: Corrige inconsistências entre profiles.profile_id e user_profile_assignments
  const ensureProfileAssignmentConsistency = async (userId: string, profileId: string): Promise<boolean> => {
    try {
      console.log(`🔧 AuthProvider - Checking assignment consistency for user: ${userId}, profile: ${profileId}`);
      
      // Verificar se existe entrada ativa em user_profile_assignments
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from('user_profile_assignments')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .maybeSingle();

      if (assignmentError) {
        console.log('⚠️ AuthProvider - Error checking assignment:', assignmentError);
        return false;
      }

      if (!existingAssignment) {
        console.log('🔧 AuthProvider - Creating missing user_profile_assignment');
        
        // Desativar assignments antigos
        await supabase
          .from('user_profile_assignments')
          .update({ is_active: false })
          .eq('user_id', userId);

        // Criar nova atribuição
        const { error: insertError } = await supabase
          .from('user_profile_assignments')
          .insert({
            user_id: userId,
            profile_id: profileId,
            assigned_by: userId, // Self-assigned para consistência
            is_active: true
          });

        if (insertError) {
          console.log('❌ AuthProvider - Failed to create assignment:', insertError);
          return false;
        }

        console.log('✅ AuthProvider - Successfully created missing assignment');
        return true;
      }

      console.log('✅ AuthProvider - Assignment consistency verified');
      return true;
    } catch (error) {
      console.log('❌ AuthProvider - Error in consistency check:', error);
      return false;
    }
  };

  // Buscar permissões do usuário - versão robusta com auto-healing
  const fetchUserPermissions = async (userId: string, retryCount: number = 0): Promise<void> => {
    const maxRetries = 3;
    const timeouts = [8000, 15000, 25000]; // Progressive timeouts: 8s, 15s, 25s
    const currentTimeout = timeouts[Math.min(retryCount, timeouts.length - 1)];
    
    console.log(`📋 AuthProvider - Fetching user permissions for: ${userId} (attempt ${retryCount + 1}, timeout: ${currentTimeout}ms)`);
    
    if (!userId) {
      console.log('⚠️ AuthProvider - No userId provided');
      setUserPermissions({});
      setUserAccessProfile(null);
      return;
    }
    
    try {
      // Exponential backoff para retries
      if (retryCount > 0) {
        const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 5000); // Max 5s delay
        console.log(`⏳ AuthProvider - Waiting ${delay}ms before retry ${retryCount}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Step 1: Verificar dados básicos do usuário
      console.log(`🔍 AuthProvider - Step 1: Checking basic profile data`);
      
      const { data: basicProfile, error: basicError } = await supabase
        .from('profiles')
        .select('id, approval_status, profile_id')
        .eq('id', userId)
        .maybeSingle();

      if (basicError || !basicProfile) {
        console.log(`❌ AuthProvider - Failed to get basic profile:`, basicError);
        throw basicError || new Error('No basic profile found');
      }

      console.log(`📋 AuthProvider - Basic profile:`, {
        userId: basicProfile.id,
        status: basicProfile.approval_status,
        profileId: basicProfile.profile_id
      });

      // Step 2: Verificar status de aprovação
      if (basicProfile.approval_status !== 'ativo') {
        console.log('⚠️ AuthProvider - User not active, status:', basicProfile.approval_status);
        
        if (basicProfile.approval_status === 'rejeitado') {
          console.log('🚪 AuthProvider - Status rejected, signing out');
          await supabase.auth.signOut();
          return;
        }
        
        // Para 'em_analise', preservar estado atual se já tinha permissões
        if (basicProfile.approval_status === 'em_analise' && !userAccessProfile) {
          console.log('⚠️ AuthProvider - User em_analise, clearing permissions');
          setUserPermissions({});
          setUserAccessProfile(null);
        } else if (basicProfile.approval_status === 'em_analise') {
          console.log('⚠️ AuthProvider - User em_analise but preserving current state for stability');
        }
        return;
      }

      // Step 3: Verificar se tem profile_id
      if (!basicProfile.profile_id) {
        console.log('⚠️ AuthProvider - User has no profile_id assigned');
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      // Step 4: Auto-healing - garantir consistência
      console.log(`🔍 AuthProvider - Step 4: Ensuring assignment consistency`);
      const isConsistent = await ensureProfileAssignmentConsistency(userId, basicProfile.profile_id);
      
      if (!isConsistent) {
        console.log('⚠️ AuthProvider - Failed to ensure consistency, but continuing...');
      }

      // Step 5: Buscar dados do access profile com timeout
      console.log(`🔍 AuthProvider - Step 5: Fetching access profile data (${basicProfile.profile_id})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ AuthProvider - Query timeout (${currentTimeout}ms) - aborting`);
        controller.abort();
      }, currentTimeout);
      
      try {
        const { data: accessProfile, error: accessError } = await supabase
          .from('access_profiles')
          .select('id, name, permissions, is_active')
          .eq('id', basicProfile.profile_id)
          .eq('is_active', true)
          .abortSignal(controller.signal)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (accessError) {
          console.log(`❌ AuthProvider - Access profile query failed:`, accessError);
          throw accessError;
        }

        if (!accessProfile) {
          console.log(`⚠️ AuthProvider - No active access profile found for ID: ${basicProfile.profile_id}`);
          setUserPermissions({});
          setUserAccessProfile(null);
          return;
        }

        console.log('✅ AuthProvider - Access profile loaded successfully:', {
          profileName: accessProfile.name,
          hasPermissions: !!accessProfile.permissions,
          permissionKeys: Object.keys(accessProfile.permissions || {})
        });

        const permissions = accessProfile.permissions || {};
        setUserPermissions(permissions as Record<string, Record<string, boolean>>);
        setUserAccessProfile(accessProfile.name || null);
        
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError; // Vai para o catch principal para retry
      }
      
    } catch (error) {
      console.error(`💥 AuthProvider - Exception loading permissions (attempt ${retryCount + 1}):`, error);
      
      // Retry em caso de exceção
      if (retryCount < maxRetries) {
        console.log(`🔄 AuthProvider - Retrying fetchUserPermissions after exception (${retryCount + 1}/${maxRetries})`);
        return await fetchUserPermissions(userId, retryCount + 1);
      }
      
      console.error('💥 AuthProvider - All retry attempts failed:', error);
      
      // Só limpar estado se não temos estado anterior válido
      if (!userAccessProfile) {
        console.log('🧹 AuthProvider - No previous valid state, clearing permissions');
        setUserPermissions({});
        setUserAccessProfile(null);
      } else {
        console.log('🛡️ AuthProvider - Preserving previous valid state due to persistent errors');
      }
    }
  };

  // Cache para debounce de verificações
  const lastProcessTimestamp = React.useRef<number>(0);
  const lastEventType = React.useRef<string>('');
  
  // Função centralizada para processar autenticação
  const processUserAuthentication = async (currentSession: Session | null, source: string) => {
    const timestamp = new Date().toISOString();
    const now = Date.now();
    const eventType = source.includes('SIGNED_IN') ? 'SIGNED_IN' : source.includes('SIGNED_OUT') ? 'SIGNED_OUT' : 'OTHER';
    
    console.log(`🔄 [${timestamp}] AuthProvider - Processing auth from ${source}`, {
      hasSession: !!currentSession,
      userEmail: currentSession?.user?.email,
      isProcessing: isProcessingAuth,
      timeSinceLastProcess: now - lastProcessTimestamp.current,
      eventType,
      lastEventType: lastEventType.current
    });

    // Debounce inteligente: 
    // - Sempre processar SIGNED_IN após SIGNED_OUT (transição crítica)
    // - Debounce apenas eventos duplicados do mesmo tipo
    const timeSinceLastProcess = now - lastProcessTimestamp.current;
    const shouldDebounce = timeSinceLastProcess < 2000 && 
                          source.includes('onAuthStateChange') && 
                          eventType === lastEventType.current && 
                          eventType !== 'SIGNED_IN'; // Nunca fazer debounce de SIGNED_IN
    
    if (shouldDebounce) {
      console.log(`⚠️ [${timestamp}] AuthProvider - Debouncing ${source} (duplicate ${eventType})`);
      return;
    }
    
    // Permitir sempre transições críticas SIGNED_OUT -> SIGNED_IN
    if (lastEventType.current === 'SIGNED_OUT' && eventType === 'SIGNED_IN') {
      console.log(`🔄 [${timestamp}] AuthProvider - Critical transition: SIGNED_OUT -> SIGNED_IN, processing immediately`);
    }

    // Evitar processamento simultâneo
    if (isProcessingAuth) {
      console.log(`⚠️ [${timestamp}] AuthProvider - Already processing, skipping ${source}`);
      return;
    }

    lastProcessTimestamp.current = now;
    lastEventType.current = eventType;
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

    // Set a maximum loading time of 30 seconds for better stability during batch operations
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⏰ AuthProvider - Loading timeout (30s) - forcing completion');
        setLoading(false);
        setIsProcessingAuth(false);
      }
    }, 30000);
    
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
