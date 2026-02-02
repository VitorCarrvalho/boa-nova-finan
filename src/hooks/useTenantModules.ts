import { useTenant } from '@/contexts/TenantContext';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';

export type TenantModulesConfig = Record<string, boolean>;

// Módulos incluídos por padrão em cada plano
export const PLAN_DEFAULT_MODULES: Record<string, string[]> = {
  free: ['dashboard', 'membros', 'eventos', 'documentacao', 'configuracoes'],
  basic: ['dashboard', 'membros', 'eventos', 'documentacao', 'configuracoes', 'congregacoes', 'ministerios', 'departamentos'],
  pro: ['dashboard', 'membros', 'eventos', 'documentacao', 'configuracoes', 'congregacoes', 'ministerios', 'departamentos', 'financeiro', 'conciliacoes', 'fornecedores', 'relatorios'],
  enterprise: MODULE_STRUCTURE.map(m => m.key), // Todos os módulos
};

// Módulos sempre disponíveis (core do sistema)
export const CORE_MODULES = ['dashboard', 'configuracoes'];

// Todos os módulos disponíveis no sistema
export const ALL_MODULES = MODULE_STRUCTURE.map(m => ({
  key: m.key,
  label: m.label,
  icon: m.icon,
}));

// Gerar configuração padrão baseada no plano
export function getDefaultModulesForPlan(planType: string): TenantModulesConfig {
  const planModules = PLAN_DEFAULT_MODULES[planType] || PLAN_DEFAULT_MODULES.free;
  const config: TenantModulesConfig = {};
  
  MODULE_STRUCTURE.forEach(module => {
    config[module.key] = planModules.includes(module.key);
  });
  
  return config;
}

// Gerar configuração com todos os módulos habilitados (para tenants existentes ou instância principal)
export function getAllModulesEnabled(): TenantModulesConfig {
  const config: TenantModulesConfig = {};
  MODULE_STRUCTURE.forEach(module => {
    config[module.key] = true;
  });
  return config;
}

export function useTenantModules() {
  const { tenant, modulesConfig } = useTenant();

  /**
   * Verifica se um módulo está habilitado para o tenant atual
   * Na instância principal (sem tenant), todos os módulos estão habilitados
   */
  const isModuleEnabled = (moduleKey: string): boolean => {
    // Se não há tenant (instância principal IPTM Global), todos os módulos estão habilitados
    if (!tenant) {
      return true;
    }

    // Se não há configuração de módulos, usar padrão do plano
    if (!modulesConfig || Object.keys(modulesConfig).length === 0) {
      const planModules = PLAN_DEFAULT_MODULES[tenant.planType] || PLAN_DEFAULT_MODULES.free;
      return planModules.includes(moduleKey);
    }

    // Módulos core sempre habilitados
    if (CORE_MODULES.includes(moduleKey)) {
      return true;
    }

    // Verificar configuração específica
    return modulesConfig[moduleKey] === true;
  };

  /**
   * Retorna lista de módulos habilitados
   */
  const getEnabledModules = (): string[] => {
    return MODULE_STRUCTURE
      .map(m => m.key)
      .filter(key => isModuleEnabled(key));
  };

  /**
   * Retorna lista de módulos desabilitados
   */
  const getDisabledModules = (): string[] => {
    return MODULE_STRUCTURE
      .map(m => m.key)
      .filter(key => !isModuleEnabled(key));
  };

  /**
   * Verifica se o módulo está incluído no plano atual
   */
  const isModuleIncludedInPlan = (moduleKey: string): boolean => {
    if (!tenant) return true;
    const planModules = PLAN_DEFAULT_MODULES[tenant.planType] || PLAN_DEFAULT_MODULES.free;
    return planModules.includes(moduleKey);
  };

  return {
    isModuleEnabled,
    getEnabledModules,
    getDisabledModules,
    isModuleIncludedInPlan,
    modulesConfig,
    currentPlan: tenant?.planType || 'enterprise',
  };
}

export default useTenantModules;
