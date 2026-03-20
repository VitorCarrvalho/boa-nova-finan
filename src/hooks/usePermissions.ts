import { useAuth } from '@/contexts/AuthContext';
import { hasNestedPermission } from '@/utils/permissionUtils';
import { useTenantModules } from '@/hooks/useTenantModules';
import useSuperAdmin from '@/hooks/useSuperAdmin';

export const usePermissions = () => {
  const { userPermissions, hasPermission, userAccessProfile } = useAuth();
  const { isModuleEnabled } = useTenantModules();
  const { isSuperAdmin } = useSuperAdmin();

  // Super Admin and org Admin always have full access
  const isFullAccess = isSuperAdmin || userAccessProfile === 'Admin';

  const checkModuleAccess = (module: string, action: string = 'view'): boolean => {
    if (isFullAccess) return true;
    if (!isModuleEnabled(module)) return false;
    return hasPermission(module, action);
  };

  const canViewModule = (module: string): boolean => checkModuleAccess(module, 'view');
  const canInsertModule = (module: string): boolean => checkModuleAccess(module, 'insert');
  const canEditModule = (module: string): boolean => checkModuleAccess(module, 'edit');
  const canDeleteModule = (module: string): boolean => checkModuleAccess(module, 'delete');
  const canApproveModule = (module: string): boolean => checkModuleAccess(module, 'approve');
  const canExportModule = (module: string): boolean => checkModuleAccess(module, 'export');
  const canSendNotificationModule = (module: string): boolean => checkModuleAccess(module, 'send_notification');

  const canViewPaidAccounts = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.paid_accounts.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewPendingApproval = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.pending_approval.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewAuthorizeAccounts = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.authorize_accounts.view') || 
           hasPermission('contas-pagar', 'approve');
  };

  const canViewApprovedAccounts = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.approved_accounts.view') || 
           hasPermission('contas-pagar', 'view');
  };

  const canViewNewAccount = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.new_account.view') || 
           hasPermission('contas-pagar', 'insert');
  };

  const canExportPaidAccounts = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.paid_accounts.export') || 
           hasPermission('contas-pagar', 'export');
  };

  const canExportApprovedAccounts = (): boolean => {
    if (isFullAccess) return true;
    return hasNestedPermission(userPermissions, 'contas-pagar.approved_accounts.export') || 
           hasPermission('contas-pagar', 'export');
  };

  const canAccessCongregation = (): boolean => {
    return false;
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
    isSuperAdmin,
    isFullAccess,
    canViewPaidAccounts,
    canViewPendingApproval,
    canViewAuthorizeAccounts,
    canViewApprovedAccounts,
    canViewNewAccount,
    canExportPaidAccounts,
    canExportApprovedAccounts
  };
};