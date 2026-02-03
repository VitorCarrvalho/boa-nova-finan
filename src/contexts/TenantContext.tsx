import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  fontFamily: string;
  churchName: string;
  tagline: string | null;
}

export interface TenantHomeConfig {
  widgets: {
    pastores: boolean;
    eventos: boolean;
    calendario: boolean;
    versiculo: boolean;
    mapa: boolean;
    instagram: boolean;
    oracao: boolean;
    conecta: boolean;
  };
  widgetOrder: string[];
  customBanners: Array<{
    imageUrl: string;
    linkUrl?: string;
    altText: string;
  }>;
}

export type TenantModulesConfig = Record<string, boolean>;

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  isActive: boolean;
  planType: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'trial' | 'active' | 'pending' | 'suspended' | 'cancelled';
  trialEndsAt: string | null;
}

export interface TenantContextType {
  tenant: Tenant | null;
  branding: TenantBranding;
  homeConfig: TenantHomeConfig;
  modulesConfig: TenantModulesConfig;
  loading: boolean;
  error: string | null;
  isMultiTenant: boolean;
  refreshTenant: () => Promise<void>;
}

const defaultBranding: TenantBranding = {
  primaryColor: '222.2 47.4% 11.2%',
  secondaryColor: '210 40% 96.1%',
  accentColor: '210 40% 96.1%',
  logoUrl: null,
  faviconUrl: null,
  fontFamily: 'Inter, sans-serif',
  churchName: 'Igreja Moove',
  tagline: 'Gestão inteligente para igrejas modernas.',
};

const defaultHomeConfig: TenantHomeConfig = {
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
};

// Por padrão, todos os módulos habilitados (para instância principal e tenants existentes)
const defaultModulesConfig: TenantModulesConfig = {};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

function getTenantIdentifier(): string | null {
  // 1. Verificar query parameter primeiro (para testes/preview)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  const hostname = window.location.hostname;
  
  // 2. Check for localhost or preview URLs (default tenant)
  if (hostname === 'localhost' || hostname.includes('lovable.app') || hostname.includes('127.0.0.1')) {
    return null; // Use default/main tenant
  }
  
  // 3. Extract subdomain from hostname
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0]; // Return subdomain
  }
  
  return null;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<TenantBranding>(defaultBranding);
  const [homeConfig, setHomeConfig] = useState<TenantHomeConfig>(defaultHomeConfig);
  const [modulesConfig, setModulesConfig] = useState<TenantModulesConfig>(defaultModulesConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantIdentifier = getTenantIdentifier();
  const isMultiTenant = tenantIdentifier !== null;

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tenantIdentifier) {
        // No tenant identifier - use defaults (main IPTM Global instance)
        setTenant(null);
        setBranding(defaultBranding);
        setHomeConfig(defaultHomeConfig);
        setModulesConfig(defaultModulesConfig);
        setLoading(false);
        return;
      }

      // Fetch tenant by subdomain
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .or(`subdomain.eq.${tenantIdentifier},slug.eq.${tenantIdentifier}`)
        .eq('is_active', true)
        .single();

      if (tenantError || !tenantData) {
        console.error('Tenant not found:', tenantError);
        setError('Organização não encontrada');
        setLoading(false);
        return;
      }

      setTenant({
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug,
        subdomain: tenantData.subdomain,
        isActive: tenantData.is_active,
        planType: tenantData.plan_type,
        subscriptionStatus: tenantData.subscription_status,
        trialEndsAt: tenantData.trial_ends_at,
      });

      // Fetch tenant settings (branding, home config, and modules)
      const { data: settingsData } = await supabase
        .from('tenant_settings')
        .select('category, settings')
        .eq('tenant_id', tenantData.id)
        .in('category', ['branding', 'home', 'modules']);

      if (settingsData) {
        settingsData.forEach((setting) => {
          if (setting.category === 'branding' && setting.settings) {
            const brandingSettings = setting.settings as Record<string, unknown>;
            setBranding({
              ...defaultBranding,
              primaryColor: (brandingSettings.primaryColor as string) || defaultBranding.primaryColor,
              secondaryColor: (brandingSettings.secondaryColor as string) || defaultBranding.secondaryColor,
              accentColor: (brandingSettings.accentColor as string) || defaultBranding.accentColor,
              logoUrl: (brandingSettings.logoUrl as string) || null,
              faviconUrl: (brandingSettings.faviconUrl as string) || null,
              fontFamily: (brandingSettings.fontFamily as string) || defaultBranding.fontFamily,
              churchName: (brandingSettings.churchName as string) || defaultBranding.churchName,
              tagline: (brandingSettings.tagline as string) || defaultBranding.tagline,
            });
          }
          if (setting.category === 'home' && setting.settings) {
            const homeSettings = setting.settings as Record<string, unknown>;
            setHomeConfig({
              ...defaultHomeConfig,
              widgets: (homeSettings.widgets as TenantHomeConfig['widgets']) || defaultHomeConfig.widgets,
              widgetOrder: (homeSettings.widgetOrder as string[]) || defaultHomeConfig.widgetOrder,
              customBanners: (homeSettings.customBanners as TenantHomeConfig['customBanners']) || [],
            });
          }
          if (setting.category === 'modules' && setting.settings) {
            const modulesSettings = setting.settings as TenantModulesConfig;
            setModulesConfig(modulesSettings);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError('Erro ao carregar dados da organização');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [tenantIdentifier]);

  // Apply branding CSS variables
  useEffect(() => {
    if (!loading) {
      const root = document.documentElement;
      root.style.setProperty('--primary', branding.primaryColor);
      root.style.setProperty('--secondary', branding.secondaryColor);
      root.style.setProperty('--accent', branding.accentColor);
      root.style.setProperty('--font-family', branding.fontFamily);
      
      // Update favicon if custom one is set
      if (branding.faviconUrl) {
        const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (favicon) {
          favicon.href = branding.faviconUrl;
        }
      }
      
      // Update document title with church name
      if (branding.churchName) {
        document.title = `${branding.churchName} - Painel Administrativo`;
      }
    }
  }, [branding, loading]);

  const value: TenantContextType = {
    tenant,
    branding,
    homeConfig,
    modulesConfig,
    loading,
    error,
    isMultiTenant,
    refreshTenant: fetchTenantData,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
