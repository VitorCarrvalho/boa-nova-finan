import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { userPermissions, hasPermission } = useAuth();

  const checkModuleAccess = (module: string, action: string = 'view'): boolean => {
    return hasPermission(module, action);
  };

  const canViewModule = (module: string): boolean => {
    return checkModuleAccess(module, 'view');
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

  // Funções específicas para submódulos de contas a pagar
  const canViewPaidAccounts = (): boolean => {
    return hasPermission('paid_accounts', 'view');
  };

  const canViewPendingApproval = (): boolean => {
    return hasPermission('pending_approval', 'view');
  };

  const canViewAuthorizeAccounts = (): boolean => {
    return hasPermission('authorize_accounts', 'view');
  };

  const canViewApprovedAccounts = (): boolean => {
    return hasPermission('approved_accounts', 'view');
  };

  const canViewNewAccount = (): boolean => {
    return hasPermission('new_account', 'view');
  };

  const canExportPaidAccounts = (): boolean => {
    return hasPermission('paid_accounts', 'export');
  };

  const canExportApprovedAccounts = (): boolean => {
    return hasPermission('approved_accounts', 'export');
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