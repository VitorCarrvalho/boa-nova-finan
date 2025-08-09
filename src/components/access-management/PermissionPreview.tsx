import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';
import { Eye, Plus, Edit, Trash2, Check, Download, Send, Shield } from 'lucide-react';

interface PermissionPreviewProps {
  permissions: Record<string, any>;
  className?: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'view': return <Eye className="h-3 w-3" />;
    case 'insert': return <Plus className="h-3 w-3" />;
    case 'edit': return <Edit className="h-3 w-3" />;
    case 'delete': return <Trash2 className="h-3 w-3" />;
    case 'approve': return <Check className="h-3 w-3" />;
    case 'export': return <Download className="h-3 w-3" />;
    case 'send': return <Send className="h-3 w-3" />;
    default: return <Shield className="h-3 w-3" />;
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case 'view': return 'Visualizar';
    case 'insert': return 'Inserir';
    case 'edit': return 'Editar';
    case 'delete': return 'Excluir';
    case 'approve': return 'Aprovar';
    case 'export': return 'Exportar';
    case 'send': return 'Enviar';
    default: return action;
  }
};

const PermissionPreview: React.FC<PermissionPreviewProps> = ({ permissions, className = '' }) => {
  const getModulePermissions = (moduleKey: string) => {
    const modulePerms = permissions[moduleKey];
    if (!modulePerms) return [];
    
    const activePermissions: Array<{ action: string; subModule?: string }> = [];
    
    // Get module-level permissions
    Object.entries(modulePerms).forEach(([key, value]) => {
      if (typeof value === 'boolean' && value) {
        activePermissions.push({ action: key });
      } else if (typeof value === 'object' && value !== null) {
        // Check submodule permissions
        Object.entries(value).forEach(([subAction, subValue]) => {
          if (subValue === true) {
            activePermissions.push({ action: subAction, subModule: key });
          }
        });
      }
    });
    
    return activePermissions;
  };

  const getTotalPermissions = () => {
    return MODULE_STRUCTURE.reduce((total, module) => {
      return total + getModulePermissions(module.key).length;
    }, 0);
  };

  const getAccessibleModules = () => {
    return MODULE_STRUCTURE.filter(module => 
      getModulePermissions(module.key).length > 0
    ).length;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Resumo de Permissões</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {getTotalPermissions()} ações
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getAccessibleModules()}/{MODULE_STRUCTURE.length} módulos
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {MODULE_STRUCTURE.map((module) => {
            const modulePermissions = getModulePermissions(module.key);
            
            if (modulePermissions.length === 0) return null;

            return (
              <div key={module.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm font-medium">{module.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {modulePermissions.length}
                  </Badge>
                </div>
                
                <div className="ml-4 space-y-1">
                  {modulePermissions.map((perm, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getActionIcon(perm.action)}
                      <span>
                        {perm.subModule ? `${perm.subModule}: ` : ''}
                        {getActionLabel(perm.action)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {getTotalPermissions() === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma permissão configurada</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PermissionPreview;