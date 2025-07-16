
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
  hasPermission: (module: string, action: string) => boolean;
  signUp: (email: string, password: string, name: string, congregationId?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

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
                .select('role, approval_status')
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
                  console.log('AuthProvider - Setting user role:', profile.role);
                  setUserRole(profile?.role ?? 'worker');
                  
                  // Buscar permissões do usuário
                  try {
                    const { data: permissions } = await supabase.rpc('get_current_user_permissions');
                    console.log('AuthProvider - User permissions:', permissions);
                    setUserPermissions(permissions as Record<string, Record<string, boolean>> || {});
                  } catch (permError) {
                    console.log('AuthProvider - Erro ao buscar permissões:', permError);
                    setUserPermissions({});
                  }
                } else {
                  console.log('AuthProvider - User not approved, setting worker role');
                  setUserRole('worker'); // Pending/rejected users get worker role (no access)
                  setUserPermissions(null);
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
                .select('role, approval_status')
                .eq('id', session.user.id)
                .single();
              
              console.log('AuthProvider - Initial profile data:', profile);
              
              // Only set role if user is approved
              if (profile?.approval_status === 'ativo') {
                console.log('AuthProvider - Setting initial user role:', profile.role);
                setUserRole(profile?.role ?? 'worker');
                
                // Buscar permissões do usuário
                try {
                  const { data: permissions } = await supabase.rpc('get_current_user_permissions');
                  console.log('AuthProvider - Initial user permissions:', permissions);
                  setUserPermissions(permissions as Record<string, Record<string, boolean>> || {});
                } catch (permError) {
                  console.log('AuthProvider - Erro ao buscar permissões iniciais:', permError);
                  setUserPermissions({});
                }
              } else {
                console.log('AuthProvider - Initial user not approved, setting worker role');
                setUserRole('worker'); // Pending/rejected users get worker role (no access)
                setUserPermissions(null);
              }
            } catch (err) {
              console.log('AuthProvider - Erro ao buscar perfil inicial:', err);
              setUserRole('worker');
              setUserPermissions(null);
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
          .select('approval_status')
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

  const hasPermission = (module: string, action: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions[module]?.[action] === true;
  };

  const value = {
    user,
    session,
    userRole,
    userPermissions,
    hasPermission,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
