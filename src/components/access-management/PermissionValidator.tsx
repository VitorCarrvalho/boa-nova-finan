import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  module?: string;
  action?: string;
}

interface PermissionValidatorProps {
  permissions: Record<string, any>;
  className?: string;
}

const PermissionValidator: React.FC<PermissionValidatorProps> = ({ 
  permissions, 
  className = '' 
}) => {
  const validatePermissions = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Check if profile has no permissions
    const hasAnyPermission = Object.values(permissions).some(modulePerms => 
      Object.values(modulePerms as Record<string, any>).some(value => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(Boolean);
        }
        return false;
      })
    );
    
    if (!hasAnyPermission) {
      results.push({
        type: 'error',
        message: 'Perfil deve ter pelo menos uma permissão ativa'
      });
      return results;
    }

    // Check for potential dependency issues
    Object.entries(permissions).forEach(([moduleKey, modulePerms]) => {
      if (typeof modulePerms === 'object' && modulePerms !== null) {
        // Check if user has edit but no view permission
        if (modulePerms.edit && !modulePerms.view) {
          results.push({
            type: 'warning',
            message: 'Recomenda-se ter permissão de "Visualizar" quando tem "Editar"',
            module: moduleKey,
            action: 'edit'
          });
        }
        
        // Check if user has delete but no edit permission
        if (modulePerms.delete && !modulePerms.edit) {
          results.push({
            type: 'warning',
            message: 'Recomenda-se ter permissão de "Editar" quando tem "Excluir"',
            module: moduleKey,
            action: 'delete'
          });
        }
        
        // Check if user has insert but no view permission
        if (modulePerms.insert && !modulePerms.view) {
          results.push({
            type: 'warning',
            message: 'Recomenda-se ter permissão de "Visualizar" quando tem "Inserir"',
            module: moduleKey,
            action: 'insert'
          });
        }

        // Check approval permissions without view
        if (modulePerms.approve && !modulePerms.view) {
          results.push({
            type: 'error',
            message: 'Permissão de "Aprovar" requer permissão de "Visualizar"',
            module: moduleKey,
            action: 'approve'
          });
        }

        // Check specific module logic
        if (moduleKey === 'financeiro' || moduleKey === 'conciliacoes') {
          if (Object.values(modulePerms).some(Boolean)) {
            results.push({
              type: 'info',
              message: 'Este módulo requer acesso a congregações para funcionar',
              module: moduleKey
            });
          }
        }

        // Check submodule permissions
        Object.entries(modulePerms).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // This is a submodule
            const subModulePerms = value as Record<string, boolean>;
            if (subModulePerms.edit && !subModulePerms.view) {
              results.push({
                type: 'warning',
                message: `Sub-módulo "${key}": recomenda-se "Visualizar" quando tem "Editar"`,
                module: moduleKey
              });
            }
          }
        });
      }
    });

    // Check for common good practices
    const hasViewDashboard = permissions.dashboard?.view;
    if (!hasViewDashboard && hasAnyPermission) {
      results.push({
        type: 'info',
        message: 'Considere adicionar acesso ao Dashboard para melhor experiência do usuário'
      });
    }

    return results;
  };

  const validationResults = validatePermissions();
  
  if (validationResults.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Configuração de permissões está correta!
        </AlertDescription>
      </Alert>
    );
  }

  const errors = validationResults.filter(r => r.type === 'error');
  const warnings = validationResults.filter(r => r.type === 'warning');
  const infos = validationResults.filter(r => r.type === 'info');

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-800 font-medium">Problemas críticos:</span>
              <Badge variant="destructive" className="text-xs">{errors.length}</Badge>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs">•</span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-800 font-medium">Recomendações:</span>
              <Badge variant="secondary" className="text-xs bg-yellow-100">{warnings.length}</Badge>
            </div>
            <ul className="text-yellow-700 text-sm space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs">•</span>
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {infos.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-800 font-medium">Informações importantes:</span>
              <Badge variant="secondary" className="text-xs bg-blue-100">{infos.length}</Badge>
            </div>
            <ul className="text-blue-700 text-sm space-y-1">
              {infos.map((info, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-xs">•</span>
                  <span>{info.message}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PermissionValidator;