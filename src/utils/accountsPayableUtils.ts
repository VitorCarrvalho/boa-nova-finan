/**
 * Utilitários para sistema de aprovação hierárquica de contas a pagar
 */

export type ApprovalLevel = 'management' | 'director' | 'president';
export type AccountStatus = 'pending_management' | 'pending_director' | 'pending_president' | 'approved' | 'paid' | 'rejected';

/**
 * Mapeia o nome do perfil de acesso para os níveis de aprovação permitidos
 */
export const getApprovalLevelsForProfile = (profileName: string): ApprovalLevel[] => {
  console.log(`[accountsPayableUtils] Checking approval levels for profile: ${profileName}`);
  
  switch (profileName) {
    case 'Gerente Financeiro':
    case 'Gerente':
      console.log(`[accountsPayableUtils] Profile ${profileName} can approve: management level`);
      return ['management'];
    
    case 'Diretor':
      console.log(`[accountsPayableUtils] Profile ${profileName} can approve: director level`);
      return ['director'];
    
    case 'Presidente':
      console.log(`[accountsPayableUtils] Profile ${profileName} can approve: president level`);
      return ['president'];
    
    case 'Admin':
      console.log(`[accountsPayableUtils] Profile ${profileName} can approve: all levels`);
      return ['management', 'director', 'president'];
    
    default:
      console.log(`[accountsPayableUtils] Profile ${profileName} cannot approve any level`);
      return [];
  }
};

/**
 * Verifica se um perfil pode aprovar uma conta em determinado status
 */
export const canApproveAtLevel = (profileName: string, accountStatus: AccountStatus): boolean => {
  console.log(`[accountsPayableUtils] Checking if profile ${profileName} can approve status ${accountStatus}`);
  
  // Validação adicional para perfis que não existem
  if (!profileName || profileName.trim() === '') {
    console.log(`[accountsPayableUtils] FAIL: Empty or null profile name`);
    return false;
  }
  
  const allowedLevels = getApprovalLevelsForProfile(profileName);
  const requiredLevel = getRequiredApprovalLevel(accountStatus);
  
  if (!requiredLevel) {
    console.log(`[accountsPayableUtils] Status ${accountStatus} does not require approval`);
    return false;
  }
  
  const canApprove = allowedLevels.includes(requiredLevel);
  console.log(`[accountsPayableUtils] Can approve: ${canApprove} (required: ${requiredLevel}, allowed: ${allowedLevels.join(', ')})`);
  
  return canApprove;
};

/**
 * Extrai o nível de aprovação necessário baseado no status da conta
 */
export const getRequiredApprovalLevel = (accountStatus: AccountStatus): ApprovalLevel | null => {
  switch (accountStatus) {
    case 'pending_management':
      return 'management';
    case 'pending_director':
      return 'director';
    case 'pending_president':
      return 'president';
    default:
      return null;
  }
};

/**
 * Determina o próximo status após aprovação em determinado nível
 */
export const getNextApprovalStatus = (currentLevel: ApprovalLevel): AccountStatus => {
  switch (currentLevel) {
    case 'management':
      return 'pending_director';
    case 'director':
      return 'pending_president';
    case 'president':
      return 'approved';
    default:
      throw new Error(`Invalid approval level: ${currentLevel}`);
  }
};

/**
 * Verifica se um usuário Admin pode aprovar todos os níveis
 */
export const isAdminProfile = (profileName: string): boolean => {
  return profileName === 'Admin';
};

/**
 * Obtém uma descrição amigável do nível de aprovação
 */
export const getApprovalLevelDescription = (level: ApprovalLevel): string => {
  switch (level) {
    case 'management':
      return 'Gerência';
    case 'director':
      return 'Diretoria';
    case 'president':
      return 'Presidência';
    default:
      return level;
  }
};

/**
 * Valida se o perfil do usuário tem permissão para aprovar contas a pagar
 */
export const validateApprovalPermission = (
  profileName: string, 
  accountStatus: AccountStatus,
  hasBasicPermission: boolean
): { canApprove: boolean; reason?: string } => {
  console.log(`[accountsPayableUtils] Validating approval permission for profile: ${profileName}, status: ${accountStatus}, hasBasicPermission: ${hasBasicPermission}`);
  
  if (!hasBasicPermission) {
    return {
      canApprove: false,
      reason: 'Usuário não possui permissão básica para aprovar contas a pagar'
    };
  }
  
  if (!canApproveAtLevel(profileName, accountStatus)) {
    const requiredLevel = getRequiredApprovalLevel(accountStatus);
    const allowedLevels = getApprovalLevelsForProfile(profileName);
    
    return {
      canApprove: false,
      reason: `Perfil ${profileName} não pode aprovar nível ${requiredLevel}. Níveis permitidos: ${allowedLevels.join(', ') || 'nenhum'}`
    };
  }
  
  return { canApprove: true };
};