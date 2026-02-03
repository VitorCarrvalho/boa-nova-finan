import { useState, useCallback } from 'react';
import { useTenant, TenantBranding, TenantHomeConfig, TenantModulesConfig } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useCurrentTenantSettings() {
  const { tenant, branding, homeConfig, modulesConfig, refreshTenant } = useTenant();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Obter tenant_id do usuário logado (da tabela profiles)
  const getTenantIdFromProfile = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return tenant?.id || null;
    
    const { data } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();
    
    return data?.tenant_id || tenant?.id || null;
  }, [user?.id, tenant?.id]);

  const saveBranding = useCallback(async (values: Partial<TenantBranding>) => {
    setLoading(true);
    try {
      const tenantId = await getTenantIdFromProfile();
      
      if (!tenantId) {
        toast.error('Não foi possível identificar a organização');
        return false;
      }

      // First check if setting exists
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('category', 'branding')
        .single();

      let error;
      if (existing?.id) {
        const result = await supabase
          .from('tenant_settings')
          .update({
            settings: values as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'branding',
            settings: values as any,
          });
        error = result.error;
      }

      if (error) throw error;

      await refreshTenant();
      toast.success('Branding salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Erro ao salvar branding');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getTenantIdFromProfile, refreshTenant]);

  const saveHomeConfig = useCallback(async (values: TenantHomeConfig) => {
    setLoading(true);
    try {
      const tenantId = await getTenantIdFromProfile();
      
      if (!tenantId) {
        toast.error('Não foi possível identificar a organização');
        return false;
      }

      // First check if setting exists
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('category', 'home')
        .single();

      let error;
      if (existing?.id) {
        const result = await supabase
          .from('tenant_settings')
          .update({
            settings: values as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'home',
            settings: values as any,
          });
        error = result.error;
      }

      if (error) throw error;

      await refreshTenant();
      toast.success('Configurações da Home salvas com sucesso!');
      return true;
    } catch (error) {
      console.error('Error saving home config:', error);
      toast.error('Erro ao salvar configurações da Home');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getTenantIdFromProfile, refreshTenant]);

  const saveModulesConfig = useCallback(async (values: TenantModulesConfig) => {
    setLoading(true);
    try {
      const tenantId = await getTenantIdFromProfile();
      
      if (!tenantId) {
        toast.error('Não foi possível identificar a organização');
        return false;
      }

      // First check if setting exists
      const { data: existing } = await supabase
        .from('tenant_settings')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('category', 'modules')
        .single();

      let error;
      if (existing?.id) {
        const result = await supabase
          .from('tenant_settings')
          .update({
            settings: values as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('tenant_settings')
          .insert({
            tenant_id: tenantId,
            category: 'modules',
            settings: values as any,
          });
        error = result.error;
      }

      if (error) throw error;

      await refreshTenant();
      toast.success('Módulos salvos com sucesso!');
      return true;
    } catch (error) {
      console.error('Error saving modules config:', error);
      toast.error('Erro ao salvar módulos');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getTenantIdFromProfile, refreshTenant]);

  return {
    tenant,
    branding,
    homeConfig,
    modulesConfig,
    loading,
    saveBranding,
    saveHomeConfig,
    saveModulesConfig,
    refreshTenant,
    getTenantIdFromProfile,
  };
}

export default useCurrentTenantSettings;
