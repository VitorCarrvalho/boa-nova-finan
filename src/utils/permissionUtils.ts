import { useAuth } from '@/contexts/AuthContext';

/**
 * Utility functions for handling nested permissions and module access
 */

/**
 * Check if a user has a nested permission (e.g., 'financeiro.despesas.view')
 * @param permissions - The permissions object from access_profiles
 * @param path - The permission path (e.g., 'financeiro.despesas.view')
 * @returns boolean indicating if the permission exists and is true
 */
export const hasNestedPermission = (permissions: Record<string, any> | null, path: string): boolean => {
  if (!permissions) return false;
  
  const keys = path.split('.');
  let current: any = permissions;
  
  for (let i = 0; i < keys.length; i++) {
    if (!current || typeof current !== 'object') return false;
    current = current[keys[i]];
  }
  
  return current === true;
};

/**
 * Get permission for a module, supporting both direct and nested permissions
 * @param permissions - The permissions object from access_profiles
 * @param module - The module name
 * @param action - The action (default: 'view')
 * @returns boolean indicating if the user has permission
 */
export const getPermissionForModule = (permissions: Record<string, any> | null, module: string, action: string = 'view'): boolean => {
  if (!permissions) return false;
  
  // Try direct permission first (e.g., permissions.financeiro.view)
  const directPermission = hasNestedPermission(permissions, `${module}.${action}`);
  if (directPermission !== undefined) return directPermission;
  
  // If no direct permission found, return false
  return false;
};

/**
 * Check if a module requires congregation access based on its permissions
 * This replaces the hardcoded requiresCongregationAccess logic
 * @param permissions - The permissions object from access_profiles  
 * @param module - The module name
 * @returns boolean indicating if congregation access is required
 */
export const requiresCongregationAccess = (permissions: Record<string, any> | null, module: string): boolean => {
  if (!permissions) return false;
  
  // Modules that typically require congregation access
  const congregationModules = ['financeiro', 'conciliacoes', 'congregacoes'];
  
  if (congregationModules.includes(module)) {
    // Check if the module has specific congregation access permission
    // If not explicitly set to false, assume it requires congregation access
    const requiresAccess = hasNestedPermission(permissions, `${module}.require_congregation_access`);
    return requiresAccess !== false; // Default to true if not explicitly set to false
  }
  
  return false;
};

/**
 * Check if user can access a module based on permissions and congregation access
 * @param permissions - The permissions object from access_profiles
 * @param module - The module name  
 * @param action - The action (default: 'view')
 * @param hasAccessToAnyCongregation - Whether user has congregation access
 * @returns boolean indicating if the user can access the module
 */
export const canAccessModule = (
  permissions: Record<string, any> | null, 
  module: string, 
  action: string = 'view',
  hasAccessToAnyCongregation: boolean = false
): boolean => {
  // First check if user has the basic permission
  if (!getPermissionForModule(permissions, module, action)) {
    return false;
  }
  
  // Then check if congregation access is required and if user has it
  if (requiresCongregationAccess(permissions, module)) {
    return hasAccessToAnyCongregation;
  }
  
  return true;
};

/**
 * Get all available sub-module permissions for a given module
 * @param permissions - The permissions object from access_profiles
 * @param module - The parent module name
 * @returns Array of sub-module names that the user has access to
 */
export const getAvailableSubmodules = (permissions: Record<string, any> | null, module: string): string[] => {
  if (!permissions || !permissions[module]) return [];
  
  const modulePermissions = permissions[module];
  const submodules: string[] = [];
  
  Object.keys(modulePermissions).forEach(key => {
    if (typeof modulePermissions[key] === 'object' && modulePermissions[key] !== null) {
      // Check if this submodule has any view permission
      if (modulePermissions[key].view === true) {
        submodules.push(key);
      }
    }
  });
  
  return submodules;
};

/**
 * Module definitions that control visibility and permissions
 */
export const MODULE_DEFINITIONS = {
  'dashboard': { requiresCongregation: false },
  'membros': { requiresCongregation: false },
  'congregacoes': { requiresCongregation: false },
  'departamentos': { requiresCongregation: false },
  'ministerios': { requiresCongregation: false },
  'eventos': { requiresCongregation: false },
  'financeiro': { requiresCongregation: true },
  'conciliacoes': { requiresCongregation: true },
  'fornecedores': { requiresCongregation: false },
  'contas-pagar': { requiresCongregation: false },
  'relatorios': { requiresCongregation: false },
  'notificacoes': { requiresCongregation: false },
  'gestao-acessos': { requiresCongregation: false },
  'documentacao': { requiresCongregation: false },
  'configuracoes': { requiresCongregation: false }
} as const;