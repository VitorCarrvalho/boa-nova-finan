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
    canSendNotificationModule
  };
};