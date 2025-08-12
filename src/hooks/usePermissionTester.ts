import { usePermissions } from './usePermissions';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionTest {
  module: string;
  action: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

interface ProfileTest {
  profileName: string;
  email: string;
  role: string;
  tests: PermissionTest[];
  overall: 'pass' | 'fail' | 'partial';
}

export const usePermissionTester = () => {
  const { userPermissions, userAccessProfile, user } = useAuth();
  const {
    canViewModule,
    canInsertModule,
    canEditModule,
    canDeleteModule,
    canApproveModule,
    canExportModule,
    canSendNotificationModule,
    canViewPaidAccounts,
    canViewPendingApproval,
    canViewAuthorizeAccounts,
    canViewApprovedAccounts,
    canViewNewAccount,
    canExportPaidAccounts,
    canExportApprovedAccounts
  } = usePermissions();

  // Definições dos testes esperados para cada perfil
  const profileExpectations: Record<string, Record<string, boolean>> = {
    'Admin': {
      'dashboard:view': true,
      'gestao-acessos:view': true,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': true,
      'contas-pagar:delete': true,
      'contas-pagar:approve': true,
      'contas-pagar:export': true,
      'financeiro:view': true,
      'financeiro:insert': true,
      'financeiro:edit': true,
      'financeiro:delete': true,
      'membros:view': true,
      'eventos:view': true,
      'congregacoes:view': true,
      'ministerios:view': true,
      'fornecedores:view': true,
      'relatorios:view': true,
      'configuracoes:view': true,
      'notificacoes:view': true
    },
    'Pastor': {
      'dashboard:view': true,
      'gestao-acessos:view': false,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': false,
      'contas-pagar:delete': false,
      'contas-pagar:approve': false,
      'contas-pagar:export': true,
      'financeiro:view': false,
      'membros:view': true,
      'membros:insert': true,
      'membros:approve': true,
      'eventos:view': true,
      'eventos:insert': true,
      'congregacoes:view': true,
      'ministerios:view': true,
      'ministerios:insert': true,
      'fornecedores:view': true,
      'relatorios:view': false,
      'configuracoes:view': false,
      'notificacoes:view': true,
      'notificacoes:insert': true
    },
    'Gerente': {
      'dashboard:view': true,
      'gestao-acessos:view': false,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': true,
      'contas-pagar:delete': true,
      'contas-pagar:approve': true,
      'contas-pagar:export': true,
      'financeiro:view': true,
      'financeiro:insert': true,
      'financeiro:edit': true,
      'membros:view': true,
      'membros:insert': true,
      'membros:edit': true,
      'eventos:view': true,
      'eventos:insert': true,
      'eventos:edit': true,
      'congregacoes:view': true,
      'congregacoes:insert': true,
      'ministerios:view': true,
      'ministerios:insert': true,
      'fornecedores:view': false,
      'relatorios:view': true,
      'relatorios:export': true,
      'configuracoes:view': false,
      'notificacoes:view': true,
      'notificacoes:insert': true,
      'notificacoes:send_notification': true
    },
    'Gerente Financeiro': {
      'dashboard:view': true,
      'gestao-acessos:view': false,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': true,
      'contas-pagar:delete': true,
      'contas-pagar:approve': true,
      'contas-pagar:export': true,
      'financeiro:view': true,
      'financeiro:insert': true,
      'financeiro:edit': true,
      'financeiro:delete': true,
      'membros:view': true,
      'membros:insert': true,
      'membros:edit': true,
      'eventos:view': true,
      'eventos:insert': true,
      'eventos:edit': true,
      'congregacoes:view': true,
      'congregacoes:insert': true,
      'congregacoes:edit': true,
      'ministerios:view': true,
      'ministerios:insert': true,
      'ministerios:edit': true,
      'fornecedores:view': true,
      'fornecedores:insert': true,
      'fornecedores:edit': true,
      'relatorios:view': true,
      'relatorios:export': true,
      'configuracoes:view': false,
      'notificacoes:view': true,
      'notificacoes:insert': true,
      'notificacoes:send_notification': true
    },
    'Diretor': {
      'dashboard:view': true,
      'gestao-acessos:view': true,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': true,
      'contas-pagar:delete': false,
      'contas-pagar:approve': true,
      'contas-pagar:export': true,
      'financeiro:view': true,
      'financeiro:insert': true,
      'financeiro:edit': true,
      'financeiro:delete': false,
      'membros:view': true,
      'membros:insert': true,
      'membros:edit': true,
      'membros:approve': true,
      'eventos:view': true,
      'eventos:insert': true,
      'eventos:edit': true,
      'eventos:delete': true,
      'congregacoes:view': true,
      'congregacoes:edit': true,
      'ministerios:view': true,
      'ministerios:insert': true,
      'ministerios:edit': true,
      'fornecedores:view': true,
      'fornecedores:insert': true,
      'fornecedores:edit': true,
      'relatorios:view': true,
      'configuracoes:view': true,
      'configuracoes:edit': true,
      'notificacoes:view': true,
      'notificacoes:insert': true,
      'notificacoes:edit': true
    },
    'Presidente': {
      'dashboard:view': true,
      'gestao-acessos:view': true,
      'contas-pagar:view': true,
      'contas-pagar:insert': true,
      'contas-pagar:edit': true,
      'contas-pagar:delete': true,
      'contas-pagar:approve': true,
      'contas-pagar:export': true,
      'financeiro:view': true,
      'financeiro:insert': true,
      'financeiro:edit': true,
      'financeiro:delete': true,
      'membros:view': true,
      'membros:insert': true,
      'membros:edit': true,
      'membros:approve': true,
      'eventos:view': true,
      'eventos:insert': true,
      'eventos:edit': true,
      'eventos:delete': true,
      'congregacoes:view': true,
      'congregacoes:edit': true,
      'congregacoes:approve': true,
      'ministerios:view': true,
      'ministerios:insert': true,
      'ministerios:edit': true,
      'fornecedores:view': true,
      'fornecedores:insert': true,
      'fornecedores:edit': true,
      'relatorios:view': true,
      'relatorios:insert': true,
      'relatorios:edit': true,
      'relatorios:delete': true,
      'configuracoes:view': true,
      'configuracoes:insert': true,
      'configuracoes:edit': true,
      'configuracoes:delete': true,
      'notificacoes:view': true,
      'notificacoes:insert': true,
      'notificacoes:edit': true
    }
  };

  const testCurrentUserPermissions = (): ProfileTest | null => {
    if (!user || !userPermissions) {
      return null;
    }

    // Determinar o perfil do usuário
    const profileName = 'Admin'; // Por exemplo, você pode buscar isso do contexto
    const expectations = profileExpectations[profileName];
    
    if (!expectations) {
      return null;
    }

    const tests: PermissionTest[] = [];

    // Testar cada permissão esperada
    Object.entries(expectations).forEach(([key, expected]) => {
      const [module, action] = key.split(':');
      
      let actual = false;
      
      // Usar as funções de permissão apropriadas
      if (action === 'view') {
        actual = canViewModule(module);
      } else if (action === 'insert') {
        actual = canInsertModule(module);
      } else if (action === 'edit') {
        actual = canEditModule(module);
      } else if (action === 'delete') {
        actual = canDeleteModule(module);
      } else if (action === 'approve') {
        actual = canApproveModule(module);
      } else if (action === 'export') {
        actual = canExportModule(module);
      } else if (action === 'send_notification') {
        actual = canSendNotificationModule(module);
      }

      tests.push({
        module,
        action,
        expected,
        actual,
        passed: expected === actual
      });
    });

    // Calcular resultado geral
    const passedTests = tests.filter(t => t.passed).length;
    const totalTests = tests.length;
    
    let overall: 'pass' | 'fail' | 'partial';
    if (passedTests === totalTests) {
      overall = 'pass';
    } else if (passedTests === 0) {
      overall = 'fail';
    } else {
      overall = 'partial';
    }

    return {
      profileName,
      email: user.email || '',
      role: userAccessProfile || '',
      tests,
      overall
    };
  };

  const getCurrentPermissionsSummary = () => {
    if (!userPermissions) {
      return { totalModules: 0, totalPermissions: 0, breakdown: {} };
    }

    const breakdown: Record<string, number> = {};
    let totalPermissions = 0;

    Object.entries(userPermissions).forEach(([module, permissions]) => {
      const modulePermissionCount = Object.values(permissions).filter(p => p === true).length;
      breakdown[module] = modulePermissionCount;
      totalPermissions += modulePermissionCount;
    });

    return {
      totalModules: Object.keys(userPermissions).length,
      totalPermissions,
      breakdown
    };
  };

  return {
    testCurrentUserPermissions,
    getCurrentPermissionsSummary,
    userPermissions,
    userAccessProfile,
    user
  };
};