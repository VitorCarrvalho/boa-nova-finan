import { useMemo } from 'react';
import { useTenant, TenantBranding } from '@/contexts/TenantContext';

interface BrandingStyles {
  primaryHsl: string;
  secondaryHsl: string;
  accentHsl: string;
  fontFamily: string;
  logoUrl: string | null;
  churchName: string;
  tagline: string | null;
}

interface UseTenantBrandingReturn {
  branding: TenantBranding;
  styles: BrandingStyles;
  loading: boolean;
  getCssVariable: (name: string) => string;
  getGradient: (direction?: string) => string;
}

export function useTenantBranding(): UseTenantBrandingReturn {
  const { branding, loading } = useTenant();

  const styles = useMemo<BrandingStyles>(() => ({
    primaryHsl: `hsl(${branding.primaryColor})`,
    secondaryHsl: `hsl(${branding.secondaryColor})`,
    accentHsl: `hsl(${branding.accentColor})`,
    fontFamily: branding.fontFamily,
    logoUrl: branding.logoUrl,
    churchName: branding.churchName,
    tagline: branding.tagline,
  }), [branding]);

  const getCssVariable = (name: string): string => {
    switch (name) {
      case 'primary':
        return branding.primaryColor;
      case 'secondary':
        return branding.secondaryColor;
      case 'accent':
        return branding.accentColor;
      default:
        return '';
    }
  };

  const getGradient = (direction = '135deg'): string => {
    return `linear-gradient(${direction}, hsl(${branding.primaryColor}), hsl(${branding.accentColor}))`;
  };

  return {
    branding,
    styles,
    loading,
    getCssVariable,
    getGradient,
  };
}

export default useTenantBranding;
