
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Save } from 'lucide-react';
import { MODULE_STRUCTURE, Module, SubModule } from '@/utils/moduleStructure';
import { useProfilePermissions, useSaveProfilePermissions, ProfilePermission } from '@/hooks/useProfilePermissions';
import { AccessProfile } from '@/hooks/useAccessProfiles';

interface PermissionMatrixProps {
  selectedProfile: AccessProfile | null;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ selectedProfile }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [permissions, setPermissions] = React.useState<Set<string>>(new Set());

  const { data: existingPermissions, isLoading } = useProfilePermissions(selectedProfile?.id || '');
  const savePermissionsMutation = useSaveProfilePermissions();

  React.useEffect(() => {
    if (existingPermissions) {
      const permissionSet = new Set(
        existingPermissions.map(p => 
          `${p.module}${p.submodule ? `::${p.submodule}` : ''}${p.sub_submodule ? `::${p.sub_submodule}` : ''}::${p.action}`
        )
      );
      setPermissions(permissionSet);
    }
  }, [existingPermissions]);

  const getPermissionKey = (module: string, submodule?: string, subSubmodule?: string, action?: string) => {
    return `${module}${submodule ? `::${submodule}` : ''}${subSubmodule ? `::${subSubmodule}` : ''}${action ? `::${action}` : ''}`;
  };

  const hasPermission = (module: string, submodule?: string, subSubmodule?: string, action?: string) => {
    return permissions.has(getPermissionKey(module, submodule, subSubmodule, action));
  };

  const togglePermission = (module: string, submodule?: string, subSubmodule?: string, action?: string) => {
    const key = getPermissionKey(module, submodule, subSubmodule, action);
    const newPermissions = new Set(permissions);
    
    if (newPermissions.has(key)) {
      newPermissions.delete(key);
    } else {
      newPermissions.add(key);
    }
    
    setPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedProfile) return;

    const permissionsList = Array.from(permissions).map(permissionKey => {
      const parts = permissionKey.split('::');
      return {
        module: parts[0],
        submodule: parts.length > 2 ? parts[1] : undefined,
        sub_submodule: parts.length > 3 ? parts[2] : undefined,
        action: parts[parts.length - 1]
      };
    });

    await savePermissionsMutation.mutateAsync({
      profileId: selectedProfile.id,
      permissions: permissionsList
    });
  };

  const renderSubModule = (module: Module, subModule: SubModule, level: number = 1) => {
    const indent = level * 20;
    
    return (
      <div key={`${module.key}-${subModule.key}`} style={{ marginLeft: `${indent}px` }} className="border-l border-gray-200 pl-4">
        <div className="flex items-center justify-between py-2 bg-gray-50 px-3 rounded">
          <span className="font-medium text-sm">{subModule.label}</span>
          <div className="flex gap-2">
            {subModule.actions.filter(action => action.applicable).map(action => (
              <div key={`${module.key}-${subModule.key}-${action.key}`} className="flex items-center gap-1">
                <Checkbox
                  checked={hasPermission(module.key, subModule.key, undefined, action.key)}
                  onCheckedChange={() => togglePermission(module.key, subModule.key, undefined, action.key)}
                />
                <Label className="text-xs">{action.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {subModule.subSubModules?.map(subSubModule => 
          renderSubModule(module, subSubModule, level + 1)
        )}
      </div>
    );
  };

  const filteredModules = MODULE_STRUCTURE.filter(module =>
    module.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.subModules?.some(sub => 
      sub.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!selectedProfile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Selecione um perfil de acesso para gerenciar as permissões</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Permissões - {selectedProfile.name}</h3>
          <p className="text-sm text-gray-600">Configure as permissões para este perfil de acesso</p>
        </div>
        <Button onClick={handleSavePermissions} disabled={savePermissionsMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {savePermissionsMutation.isPending ? 'Salvando...' : 'Salvar Permissões'}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar módulos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredModules.map(module => (
          <Card key={module.key}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">{module.label}</span>
                <div className="flex gap-2">
                  {module.actions.filter(action => action.applicable).map(action => (
                    <div key={`${module.key}-${action.key}`} className="flex items-center gap-1">
                      <Checkbox
                        checked={hasPermission(module.key, undefined, undefined, action.key)}
                        onCheckedChange={() => togglePermission(module.key, undefined, undefined, action.key)}
                      />
                      <Label className="text-xs">{action.label}</Label>
                    </div>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {module.subModules?.map(subModule => renderSubModule(module, subModule))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PermissionMatrix;
