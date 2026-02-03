import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TenantUser {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'manager';
  created_at: string;
  invited_by: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface CreateTenantUserInput {
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'admin' | 'manager';
}

export function useTenantUsers(tenantId: string | null) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);

      // Fetch tenant admins with profile info
      const { data: admins, error } = await supabase
        .from('tenant_admins')
        .select(`
          id,
          user_id,
          tenant_id,
          role,
          created_at,
          invited_by
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for these users
      const userIds = admins?.map(a => a.user_id) || [];
      
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      const usersWithProfiles: TenantUser[] = (admins || []).map(admin => {
        const profile = profiles?.find(p => p.id === admin.user_id);
        return {
          ...admin,
          role: admin.role as 'owner' | 'admin' | 'manager',
          user: {
            name: profile?.name || 'Nome não disponível',
            email: profile?.email || 'Email não disponível',
          },
        };
      });

      setUsers(usersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching tenant users:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, toast]);

  const createUser = async (input: CreateTenantUserInput): Promise<boolean> => {
    if (!tenantId) return false;
    
    try {
      setCreating(true);

      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('create-tenant-user', {
        body: {
          tenantId,
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      toast({
        title: 'Sucesso',
        description: `Usuário ${input.name} criado com sucesso!`,
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error creating tenant user:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o usuário.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'owner' | 'admin' | 'manager'): Promise<boolean> => {
    if (!tenantId) return false;
    
    try {
      const { error } = await supabase
        .from('tenant_admins')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeUser = async (userId: string): Promise<boolean> => {
    if (!tenantId) return false;
    
    try {
      // Remove from tenant_admins only
      const { error } = await supabase
        .from('tenant_admins')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Usuário removido do tenant.',
      });

      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Error removing tenant user:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o usuário.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    users,
    loading,
    creating,
    fetchUsers,
    createUser,
    updateUserRole,
    removeUser,
  };
}
