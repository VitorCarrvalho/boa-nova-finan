
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

// Cache utility functions
const CACHE_KEY = 'lovable_user_data';
const CACHE_VERSION = '1.0';

const saveUserDataToCache = (user: any, permissions: any, accessProfile: any) => {
  try {
    const cacheData = {
      version: CACHE_VERSION,
      user,
      permissions,
      accessProfile,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: user?.id + '_' + Date.now() // unique session identifier
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`💾 AuthProvider - User data saved to cache for ${user?.email || user?.id}`);
  } catch (error) {
    console.error('❌ AuthProvider - Failed to save cache:', error);
  }
};

const getUserDataFromCache = (expectedUserId?: string) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      console.log('📭 AuthProvider - No cache data found');
      return null;
    }
    
    const data = JSON.parse(cached);
    
    // Version check
    if (data.version !== CACHE_VERSION) {
      console.log('🔄 AuthProvider - Cache version mismatch, clearing old cache');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Expiry check (24 hours)
    const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      console.log('⏰ AuthProvider - Cache expired, clearing');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // User ID consistency check
    if (expectedUserId && data.userId !== expectedUserId) {
      console.log(`🔄 AuthProvider - Cache user mismatch (expected: ${expectedUserId}, cached: ${data.userId}), clearing`);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Integrity check
    if (!data.user || !data.accessProfile) {
      console.log('⚠️ AuthProvider - Cache data incomplete, clearing');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    console.log(`✅ AuthProvider - Valid cache found for ${data.user?.email || data.userId}`);
    return data;
  } catch (error) {
    console.error('❌ AuthProvider - Failed to load cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const clearUserDataCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log('🗑️ AuthProvider - User data cache cleared');
};

// Função para limpar estado de autenticação completa
const cleanupAuthState = () => {
  console.log('🧹 Limpando estado de autenticação completo...');
  
  try {
    // Clear our user data cache
    clearUserDataCache();
    
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

  // Verificar consistência sem criar desnecessariamente
  const verifyProfileAssignmentConsistency = async (userId: string, profileId: string): Promise<boolean> => {
    try {
      console.log(`🔧 AuthProvider - Verifying assignment consistency for user: ${userId}, profile: ${profileId}`);
      
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

      if (existingAssignment) {
        console.log('✅ AuthProvider - Assignment already exists and is active, skipping creation');
        return true;
      }

      console.log('⚠️ AuthProvider - No active assignment found, but not creating to avoid RLS issues');
      console.log('ℹ️ AuthProvider - This should be handled by admin approval process');
      return false; // Don't try to create, let admin process handle it
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
        const delay = Math.min(1000 * Math.pow(1.5, retryCount - 1), 5000);
        console.log(`⏳ AuthProvider - Waiting ${delay}ms before retry ${retryCount}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Step 0: Check if user is Super Admin (bypass all profile/RLS checks)
      console.log(`🔍 AuthProvider - Step 0: Checking super_admins table`);
      const { data: superAdminData, error: superAdminError } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!superAdminError && superAdminData) {
        console.log('🚀 AuthProvider - User is Super Admin, bypassing profile checks');
        setUserPermissions({});
        setUserAccessProfile('SuperAdmin');
        saveUserDataToCache(
          { id: userId, email: user?.email },
          {},
          'SuperAdmin'
        );
        return;
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

      // Step 4: Verificar consistência das atribuições (sem criar desnecessariamente)
      console.log(`🔍 AuthProvider - Step 4: Verifying assignment consistency`);
      try {
        await verifyProfileAssignmentConsistency(userId, basicProfile.profile_id);
      } catch (error) {
        console.warn('⚠️ AuthProvider - Failed to verify consistency, but continuing...', error);
      }

      // Step 5: Fetch access profile data using secure function to bypass RLS
      console.log(`🔍 AuthProvider - Step 5: Fetching access profile data using secure function`);
      
      let accessProfileData = null;
      
      try {
        // Use the new security definer function to bypass RLS deadlock
        const { data: functionResult, error: functionError } = await supabase
          .rpc('get_authenticated_user_permissions');

        if (!functionError && functionResult && typeof functionResult === 'object' && functionResult !== null) {
          const result = functionResult as { profile_name?: string; permissions?: Record<string, any> };
          if (result.profile_name) {
            accessProfileData = {
              name: result.profile_name,
              permissions: result.permissions || {}
            };
            console.log(`✅ AuthProvider - Secure function successful: ${accessProfileData.name}`);
          } else {
            console.log('⚠️ AuthProvider - Secure function returned no profile name');
          }
        } else {
          console.log('⚠️ AuthProvider - Secure function failed or no profile:', functionError);
          
          // Fallback: try direct access_profiles query (now should work with new RLS policy)
          console.log('🔄 AuthProvider - Trying direct access_profiles query as fallback');
          const { data, error } = await supabase
            .from('access_profiles')
            .select('name, permissions')
            .eq('id', basicProfile.profile_id)
            .eq('is_active', true)
            .single();

          if (!error && data) {
            accessProfileData = data;
            console.log(`✅ AuthProvider - Direct query fallback successful: ${accessProfileData.name}`);
          } else {
            console.log('❌ AuthProvider - Direct query fallback also failed:', error);
          }
        }
      } catch (error) {
        console.log('❌ AuthProvider - All query attempts failed:', error);
      }

      if (!accessProfileData) {
        console.warn('⚠️ AuthProvider - No access profile found after all attempts');
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      console.log('✅ AuthProvider - Access profile loaded successfully:', {
        profileName: accessProfileData.name,
        hasPermissions: !!accessProfileData.permissions,
        permissionKeys: Object.keys(accessProfileData.permissions || {})
      });

      const permissions = accessProfileData.permissions || {};
      setUserPermissions(permissions as Record<string, Record<string, boolean>>);
      setUserAccessProfile(accessProfileData.name || null);
      
      // Save successful data to cache
      saveUserDataToCache(
        { id: userId, email: user?.email }, 
        permissions, 
        accessProfileData.name
      );
      
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
        console.log(`👤 [${timestamp}] AuthProvider - User found from ${source} (${currentSession.user.email}), checking cache first...`);
        
        // Check cache first to avoid unnecessary database calls
        const cachedData = getUserDataFromCache(currentSession.user.id);
        if (cachedData && cachedData.userId === currentSession.user.id) {
          console.log(`⚡ [${timestamp}] AuthProvider - Using valid cached data for instant load`);
          setUserPermissions(cachedData.permissions);
          setUserAccessProfile(cachedData.accessProfile);
        } else {
          console.log(`🔍 [${timestamp}] AuthProvider - No valid cache found, fetching fresh data from database`);
          try {
            await fetchUserPermissions(currentSession.user.id);
          } catch (error) {
            console.error(`❌ [${timestamp}] AuthProvider - Failed to fetch permissions, trying cache as fallback:`, error);
            
            // Try to use any cached data as fallback, even if slightly stale
            const fallbackCache = localStorage.getItem(CACHE_KEY);
            if (fallbackCache) {
              try {
                const fallbackData = JSON.parse(fallbackCache);
                if (fallbackData.userId === currentSession.user.id && fallbackData.accessProfile) {
                  console.log(`🆘 [${timestamp}] AuthProvider - Using fallback cache data`);
                  setUserPermissions(fallbackData.permissions || {});
                  setUserAccessProfile(fallbackData.accessProfile);
                  return;
                }
              } catch (fallbackError) {
                console.error('❌ AuthProvider - Fallback cache also failed:', fallbackError);
              }
            }
            
            // If all else fails, clear state
            console.log(`🚨 [${timestamp}] AuthProvider - All fallbacks failed, clearing state`);
            setUserPermissions({});
            setUserAccessProfile(null);
          }
        }
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
      
      // Limpar cache primeiro
      clearUserDataCache();
      
      // Limpar estado completo
      cleanupAuthState();
      
      // Tentar logout global
      await supabase.auth.signOut({ scope: 'global' });
      
      // Forçar refresh da página para garantir limpeza completa
      window.location.href = '/';
    } catch (error) {
      console.log('Erro no logout:', error);
      // Mesmo com erro, forçar refresh
      window.location.href = '/';
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
