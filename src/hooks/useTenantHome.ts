import { useMemo } from 'react';
import { useTenant, TenantHomeConfig } from '@/contexts/TenantContext';

interface UseTenantHomeReturn {
  homeConfig: TenantHomeConfig;
  loading: boolean;
  isWidgetEnabled: (widgetKey: string) => boolean;
  getOrderedWidgets: () => string[];
  getCustomBanners: () => TenantHomeConfig['customBanners'];
}

export function useTenantHome(): UseTenantHomeReturn {
  const { homeConfig, loading } = useTenant();

  const isWidgetEnabled = (widgetKey: string): boolean => {
    const key = widgetKey as keyof TenantHomeConfig['widgets'];
    return homeConfig.widgets[key] ?? true;
  };

  const getOrderedWidgets = (): string[] => {
    // Return only enabled widgets in the configured order
    return homeConfig.widgetOrder.filter((widgetKey) => isWidgetEnabled(widgetKey));
  };

  const getCustomBanners = (): TenantHomeConfig['customBanners'] => {
    return homeConfig.customBanners || [];
  };

  return {
    homeConfig,
    loading,
    isWidgetEnabled,
    getOrderedWidgets,
    getCustomBanners,
  };
}

export default useTenantHome;
