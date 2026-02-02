import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tenant, TenantBranding, TenantHomeConfig, TenantModulesConfig } from '@/contexts/TenantContext';

interface TenantWithSettings extends Tenant {
  branding?: TenantBranding;
  homeConfig?: TenantHomeConfig;
  modulesConfig?: TenantModulesConfig;
  adminsCount?: number;
  usersCount?: number;
}

interface CreateTenantInput {
  name: string;
  slug: string;
  subdomain: string;
  planType?: 'free' | 'basic' | 'pro' | 'enterprise';
}

interface UpdateTenantInput {
  name?: string;
  slug?: string;
  subdomain?: string;
  isActive?: boolean;
  planType?: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus?: 'trial' | 'active' | 'pending' | 'suspended' | 'cancelled';
}

export function useTenantAdmin() {
  const [tenants, setTenants] = useState<TenantWithSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { toast } = useToast();

  const checkSuperAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      
      const isAdmin = await checkSuperAdminStatus();
      setIsSuperAdmin(isAdmin);
      
      if (!isAdmin) {
        setTenants([]);
        return;
      }

      const { data: tenantsData, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tenantsWithSettings: TenantWithSettings[] = await Promise.all(
        (tenantsData || []).map(async (t) => {
          // Fetch settings for each tenant
          const { data: settingsData } = await supabase
            .from('tenant_settings')
            .select('category, settings')
            .eq('tenant_id', t.id);

          // Fetch counts
          const { count: adminsCount } = await supabase
            .from('tenant_admins')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', t.id);

          const { count: usersCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', t.id);

          let branding: TenantBranding | undefined;
          let homeConfig: TenantHomeConfig | undefined;
          let modulesConfig: TenantModulesConfig | undefined;

          settingsData?.forEach((s) => {
            const settings = s.settings as Record<string, unknown>;
            if (s.category === 'branding') {
              branding = settings as unknown as TenantBranding;
            }
            if (s.category === 'home') {
              homeConfig = settings as unknown as TenantHomeConfig;
            }
            if (s.category === 'modules') {
              modulesConfig = settings as unknown as TenantModulesConfig;
            }
          });

          return {
            id: t.id,
            name: t.name,
            slug: t.slug,
            subdomain: t.subdomain,
            isActive: t.is_active,
            planType: t.plan_type,
            subscriptionStatus: t.subscription_status,
            trialEndsAt: t.trial_ends_at,
            branding,
            homeConfig,
            modulesConfig,
            adminsCount: adminsCount || 0,
            usersCount: usersCount || 0,
          };
        })
      );

      setTenants(tenantsWithSettings);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tenants.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [checkSuperAdminStatus, toast]);

  const createTenant = async (input: CreateTenantInput): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: input.name,
          slug: input.slug,
          subdomain: input.subdomain,
          plan_type: input.planType || 'free',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default branding settings
      await supabase.from('tenant_settings').insert({
        tenant_id: data.id,
        category: 'branding',
        settings: {
          primaryColor: '222.2 47.4% 11.2%',
          secondaryColor: '210 40% 96.1%',
          accentColor: '210 40% 96.1%',
          logoUrl: null,
          faviconUrl: null,
          fontFamily: 'Inter, sans-serif',
          churchName: input.name,
          tagline: null,
        },
        updated_by: user.id,
      });

      // Create default home settings
      await supabase.from('tenant_settings').insert({
        tenant_id: data.id,
        category: 'home',
        settings: {
          widgets: {
            pastores: true,
            eventos: true,
            calendario: true,
            versiculo: true,
            mapa: true,
            instagram: true,
            oracao: true,
            conecta: true,
          },
          widgetOrder: ['pastores', 'eventos', 'calendario', 'versiculo', 'mapa', 'instagram', 'oracao', 'conecta'],
          customBanners: [],
        },
        updated_by: user.id,
      });

      toast({
        title: 'Sucesso',
        description: 'Tenant criado com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o tenant.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTenant = async (tenantId: string, input: UpdateTenantInput): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.subdomain !== undefined) updateData.subdomain = input.subdomain;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;
      if (input.planType !== undefined) updateData.plan_type = input.planType;
      if (input.subscriptionStatus !== undefined) updateData.subscription_status = input.subscriptionStatus;

      const { error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tenant atualizado com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o tenant.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTenantBranding = async (tenantId: string, branding: Partial<TenantBranding>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id, settings')
        .eq('tenant_id', tenantId)
        .eq('category', 'branding')
        .single();

      const existingSettings = existing?.settings as Record<string, unknown> || {};
      const updatedSettings = { ...existingSettings, ...branding };

      if (existing) {
        const { error } = await supabase
          .from('tenant_settings')
          .update({ settings: updatedSettings, updated_by: user?.id })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'branding',
            settings: updatedSettings,
            updated_by: user?.id,
          });
        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Branding atualizado com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error updating branding:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o branding.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTenantHomeConfig = async (tenantId: string, homeConfig: Partial<TenantHomeConfig>): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id, settings')
        .eq('tenant_id', tenantId)
        .eq('category', 'home')
        .single();

      const existingSettings = existing?.settings as Record<string, unknown> || {};
      const updatedSettings = { ...existingSettings, ...homeConfig };

      if (existing) {
        const { error } = await supabase
          .from('tenant_settings')
          .update({ settings: updatedSettings, updated_by: user?.id })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'home',
            settings: updatedSettings,
            updated_by: user?.id,
          });
        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Configuração da Home atualizada com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error updating home config:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a configuração.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTenant = async (tenantId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tenant excluído com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir o tenant.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTenantModules = async (tenantId: string, modules: TenantModulesConfig): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id, settings')
        .eq('tenant_id', tenantId)
        .eq('category', 'modules')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('tenant_settings')
          .update({ settings: modules, updated_by: user?.id })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'modules',
            settings: modules,
            updated_by: user?.id,
          });
        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Módulos atualizados com sucesso!',
      });

      await fetchTenants();
      return true;
    } catch (error: any) {
      console.error('Error updating modules:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar os módulos.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return {
    tenants,
    loading,
    isSuperAdmin,
    fetchTenants,
    createTenant,
    updateTenant,
    updateTenantBranding,
    updateTenantHomeConfig,
    updateTenantModules,
    deleteTenant,
  };
}

export default useTenantAdmin;
