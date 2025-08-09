import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { hasNestedPermission, getPermissionForModule, MODULE_DEFINITIONS } from '@/utils/permissionUtils';

export const usePermissions = () => {
  const { userPermissions, hasPermission } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const hasAccessToAnyCongregation = congregationAccess?.hasAccess || false;

  const checkModuleAccess = (module: string, action: string = 'view'): boolean => {
    return hasPermission(module, action);
  };

  const canViewModule = (module: string): boolean => {
    // Check basic permission first
    if (!hasPermission(module, 'view')) {
      return false;
    }
    
    // Check congregation access if required
    const moduleConfig = MODULE_DEFINITIONS[module as keyof typeof MODULE_DEFINITIONS];
    if (moduleConfig?.requiresCongregation) {
      return hasAccessToAnyCongregation;
    }
    
    return true;
  };

  const canInsertModule = (module: string): boolean => {
    return checkModuleAccess(module, 'insert');
  };

  const canEditModule = (module: string): boolean => {
    return checkModuleAccess(module, 'edit');
  };

  const canDeleteModule = (module: string): boolean => {
    return checkModuleAccess(module, 'delete');
  };

  const canApproveModule = (module: string): boolean => {
    return checkModuleAccess(module, 'approve');
  };

  const canExportModule = (module: string): boolean => {
    return checkModuleAccess(module, 'export');
  };

  const canSendNotificationModule = (module: string): boolean => {
    return checkModuleAccess(module, 'send_notification');
  };

  // Funções específicas para submódulos de contas a pagar com permissões aninhadas
  const canViewPaidAccounts = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.paid_accounts.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewPendingApproval = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.pending_approval.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewAuthorizeAccounts = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.authorize_accounts.view') || 
           hasPermission('contas-pagar', 'approve');
  };

  const canViewApprovedAccounts = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.approved_accounts.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewNewAccount = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.new_account.view') || 
           hasPermission('contas-pagar', 'insert');
  };

  const canExportPaidAccounts = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.paid_accounts.export') || 
           hasPermission('contas-pagar', 'export');
  };

  const canExportApprovedAccounts = (): boolean => {
    return hasNestedPermission(userPermissions, 'contas-pagar.approved_accounts.export') || 
           hasPermission('contas-pagar', 'export');
  };

  // Nova função para verificar acesso baseado apenas em permissões
  const canAccessCongregation = (): boolean => {
    return hasAccessToAnyCongregation;
  };

  return {
    userPermissions,
    hasPermission,
    checkModuleAccess,
    canViewModule,
    canInsertModule,
    canEditModule,
    canDeleteModule,
    canApproveModule,
    canExportModule,
    canSendNotificationModule,
    canAccessCongregation,
    // Submódulo específicas
    canViewPaidAccounts,
    canViewPendingApproval,
    canViewAuthorizeAccounts,
    canViewApprovedAccounts,
    canViewNewAccount,
    canExportPaidAccounts,
    canExportApprovedAccounts
  };
};