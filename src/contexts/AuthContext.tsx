
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

  const fetchUserPermissions = async (userId: string): Promise<void> => {
    try {
      console.log('📋 AuthProvider - Fetching user permissions for:', userId);
      
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
        console.error('❌ AuthProvider - Error fetching profile:', profileError);
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      if (!profile) {
        console.log('⚠️ AuthProvider - No profile found for user:', userId);
        setUserPermissions({});
        setUserAccessProfile(null);
        return;
      }

      // Check approval status first
      if (profile.approval_status !== 'ativo') {
        console.log('⚠️ AuthProvider - User not active, status:', profile.approval_status);
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
      console.error('💥 AuthProvider - Exception loading permissions:', error);
      console.error('💥 Stack:', error);
      setUserPermissions({});
      setUserAccessProfile(null);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider - Setting up AuthProvider...');
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Set a maximum loading time of 8 seconds
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⏰ AuthProvider - Loading timeout - forcing completion');
        setLoading(false);
      }
    }, 8000);
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider - Auth state change:', event, session?.user?.email);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthProvider - User authenticated, checking approval status...');
          
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('approval_status')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('📊 AuthProvider - Profile data:', profile);
            
            if (error) {
              console.error('❌ AuthProvider - Error fetching profile:', error);
              setUserPermissions(null);
              setUserAccessProfile(null);
              if (isMounted) setLoading(false);
              clearTimeout(timeoutId);
              return;
            }

            if (profile?.approval_status === 'ativo') {
              console.log('✅ AuthProvider - User approved, loading permissions...');
              await fetchUserPermissions(session.user.id);
              if (isMounted) setLoading(false);
            } else {
              console.log('⚠️ AuthProvider - User not approved, status:', profile?.approval_status);
              setUserPermissions(null);
              setUserAccessProfile(null);
              if (isMounted) setLoading(false);
            }
          } catch (err) {
            console.error('💥 AuthProvider - Exception checking profile:', err);
            setUserPermissions(null);
            setUserAccessProfile(null);
            if (isMounted) setLoading(false);
          }
        } else {
          console.log('🚪 AuthProvider - No user, clearing permissions');
          setUserPermissions(null);
          setUserAccessProfile(null);
          if (isMounted) setLoading(false);
        }
        
        clearTimeout(timeoutId);
      }
    );

    // Verificar sessão existente
    const checkSession = async () => {
      try {
        console.log('🔍 AuthProvider - Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider - Error checking session:', error);
          cleanupAuthState();
          if (isMounted) setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        console.log('📋 AuthProvider - Existing session:', session?.user?.email);
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthProvider - Existing user found, checking status...');
          
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('approval_status')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('📊 AuthProvider - Initial profile data:', profile);
            
            if (profile?.approval_status === 'ativo') {
              console.log('✅ AuthProvider - Initial user approved, loading permissions...');
              await fetchUserPermissions(session.user.id);
              if (isMounted) setLoading(false);
            } else {
              console.log('⚠️ AuthProvider - Initial user not approved, status:', profile?.approval_status);
              setUserPermissions(null);
              setUserAccessProfile(null);
              if (isMounted) setLoading(false);
            }
          } catch (err) {
            console.error('💥 AuthProvider - Exception checking initial profile:', err);
            setUserPermissions(null);
            setUserAccessProfile(null);
            if (isMounted) setLoading(false);
          }
        } else {
          if (isMounted) setLoading(false);
        }
        
        clearTimeout(timeoutId);
      } catch (err) {
        console.error('💥 AuthProvider - General exception checking session:', err);
        cleanupAuthState();
        if (isMounted) setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    checkSession();

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
        console.log('Erro no login:', error);
        return { error };
      }
      
      // Check user approval status after successful login
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('approval_status, access_profiles(name)')
          .eq('id', data.user.id)
          .maybeSingle();
        
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
      
      console.log('✅ Login realizado com sucesso:', data);
      
      // Force refresh da página para garantir estado limpo
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
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
