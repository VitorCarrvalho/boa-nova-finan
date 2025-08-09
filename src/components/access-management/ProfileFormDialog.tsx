import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';
import ProfileTemplates, { ProfileTemplate } from './ProfileTemplates';
import PermissionPreview from './PermissionPreview';
import PermissionValidator from './PermissionValidator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const systemModules = MODULE_STRUCTURE.map(module => ({
  name: module.key,
  label: module.label,
  actions: module.actions.map(action => action.key),
  subModules: module.subModules?.map(sub => ({
    name: sub.key,
    label: sub.label,
    actions: sub.actions.map(action => action.key)
  })) || []
}));

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    description: string;
    permissions: Record<string, any>;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => Promise<void>;
  isEditing: boolean;
  isLoading?: boolean;
}

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSave,
  isEditing,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const globalCheckboxRef = useRef<HTMLButtonElement>(null);
  const moduleCheckboxRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Set indeterminate state for checkboxes
  useEffect(() => {
    // Global checkbox
    if (globalCheckboxRef.current) {
      const inputElement = globalCheckboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.indeterminate = calculateGlobalState() === 'indeterminate';
      }
    }

    // Module checkboxes
    systemModules.forEach(module => {
      const moduleRef = moduleCheckboxRefs.current[module.name];
      if (moduleRef) {
        const inputElement = moduleRef.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.indeterminate = calculateModuleState(module.name) === 'indeterminate';
        }
      }
    });
  }, [formData.permissions]);

  const handlePermissionChange = (moduleName: string, permissionType: string, checked: boolean, subModuleName?: string) => {
    onFormDataChange({
      ...formData,
      permissions: {
        ...formData.permissions,
        [moduleName]: {
          ...formData.permissions[moduleName],
          [subModuleName || permissionType]: subModuleName ? {
            ...formData.permissions[moduleName][subModuleName],
            [permissionType]: checked
          } : checked
        }
      }
    });
  };

  // Calculate global state (all permissions across all modules)
  const calculateGlobalState = () => {
    const allPermissions = systemModules.flatMap(module => {
      const modulePermissions = module.actions.map(action => 
        formData.permissions[module.name]?.[action] || false
      );
      const subModulePermissions = module.subModules.flatMap(subModule =>
        subModule.actions.map(action =>
          formData.permissions[module.name]?.[subModule.name]?.[action] || false
        )
      );
      return [...modulePermissions, ...subModulePermissions];
    });
    
    const checkedCount = allPermissions.filter(Boolean).length;
    const totalCount = allPermissions.length;
    
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === totalCount) return 'checked';
    return 'indeterminate';
  };

  // Calculate module state (all actions within a module including submodules)
  const calculateModuleState = (moduleName: string) => {
    const module = systemModules.find(m => m.name === moduleName);
    if (!module) return 'unchecked';
    
    const modulePermissions = module.actions.map(action => 
      formData.permissions[moduleName]?.[action] || false
    );
    const subModulePermissions = module.subModules.flatMap(subModule =>
      subModule.actions.map(action =>
        formData.permissions[moduleName]?.[subModule.name]?.[action] || false
      )
    );
    
    const allPermissions = [...modulePermissions, ...subModulePermissions];
    const checkedCount = allPermissions.filter(Boolean).length;
    const totalCount = allPermissions.length;
    
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === totalCount) return 'checked';
    return 'indeterminate';
  };

  // Handle global select all
  const handleSelectAllGlobal = () => {
    const globalState = calculateGlobalState();
    const shouldCheck = globalState !== 'checked';
    
    const newPermissions = { ...formData.permissions };
    systemModules.forEach(module => {
      // Set module-level actions
      module.actions.forEach(action => {
        newPermissions[module.name] = {
          ...newPermissions[module.name],
          [action]: shouldCheck
        };
      });
      
      // Set submodule actions
      module.subModules.forEach(subModule => {
        subModule.actions.forEach(action => {
          newPermissions[module.name] = {
            ...newPermissions[module.name],
            [subModule.name]: {
              ...newPermissions[module.name]?.[subModule.name],
              [action]: shouldCheck
            }
          };
        });
      });
    });
    
    onFormDataChange({
      ...formData,
      permissions: newPermissions
    });
  };

  // Handle module select all
  const handleSelectAllModule = (moduleName: string) => {
    const moduleState = calculateModuleState(moduleName);
    const shouldCheck = moduleState !== 'checked';
    const module = systemModules.find(m => m.name === moduleName);
    if (!module) return;
    
    const newModulePermissions = { ...formData.permissions[moduleName] };
    
    // Set module-level actions
    module.actions.forEach(action => {
      newModulePermissions[action] = shouldCheck;
    });
    
    // Set submodule actions
    module.subModules.forEach(subModule => {
      subModule.actions.forEach(action => {
        newModulePermissions[subModule.name] = {
          ...newModulePermissions[subModule.name],
          [action]: shouldCheck
        };
      });
    });
    
    onFormDataChange({
      ...formData,
      permissions: {
        ...formData.permissions,
        [moduleName]: newModulePermissions
      }
    });
  };

  const handleTemplateSelect = (template: ProfileTemplate) => {
    onFormDataChange({
      ...formData,
      permissions: template.permissions
    });
    setActiveTab('permissions');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações e permissões do perfil' : 'Configure as informações e permissões para o novo perfil'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informações</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="preview">Revisão</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Perfil *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                    placeholder="Ex: Analista Financeiro"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                    placeholder="Descreva as responsabilidades deste perfil"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <ProfileTemplates onSelectTemplate={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Permissões por Módulo</h4>
                <div className="flex items-center space-x-2 bg-primary/5 px-3 py-2 rounded-lg">
                  <Checkbox
                    id="select-all-global"
                    checked={calculateGlobalState() === 'checked'}
                    ref={globalCheckboxRef}
                    onCheckedChange={handleSelectAllGlobal}
                  />
                  <Label htmlFor="select-all-global" className="text-sm font-medium text-primary">
                    Selecionar Todas
                  </Label>
                </div>
              </div>

              <div className="grid gap-4">
                {systemModules.map((module) => (
                  <Card key={module.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{module.label}</h5>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {module.actions.length + module.subModules.reduce((acc, sub) => acc + sub.actions.length, 0)} ações
                        </Badge>
                        <div className="flex items-center space-x-2 bg-secondary/50 px-2 py-1 rounded">
                          <Checkbox
                            id={`select-all-${module.name}`}
                            checked={calculateModuleState(module.name) === 'checked'}
                            ref={(ref) => {
                              moduleCheckboxRefs.current[module.name] = ref;
                            }}
                            onCheckedChange={() => handleSelectAllModule(module.name)}
                          />
                          <Label htmlFor={`select-all-${module.name}`} className="text-xs font-medium">
                            Todas
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Module-level actions */}
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Ações Gerais:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {module.actions.map((action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${module.name}-${action}`}
                              checked={formData.permissions[module.name]?.[action] || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(module.name, action, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`${module.name}-${action}`}
                              className="text-sm"
                            >
                              {getActionLabel(action)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submodules */}
                    {module.subModules.length > 0 && (
                      <div>
                        <Separator className="mb-3" />
                        <div className="space-y-3">
                          {module.subModules.map((subModule) => (
                            <div key={subModule.name} className="border-l-2 border-border pl-4">
                              <div className="text-sm font-medium mb-2 text-muted-foreground">{subModule.label}:</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {subModule.actions.map((action) => (
                                  <div key={action} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${module.name}-${subModule.name}-${action}`}
                                      checked={formData.permissions[module.name]?.[subModule.name]?.[action] || false}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(module.name, action, checked as boolean, subModule.name)
                                      }
                                    />
                                    <Label 
                                      htmlFor={`${module.name}-${subModule.name}-${action}`}
                                      className="text-sm"
                                    >
                                      {getActionLabel(action)}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Informações do Perfil</h4>
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Nome</Label>
                        <p className="font-medium">{formData.name || 'Sem nome'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Descrição</Label>
                        <p className="text-sm">{formData.description || 'Sem descrição'}</p>
                      </div>
                    </div>
                  </Card>

                  <PermissionValidator permissions={formData.permissions} />
                </div>

                <PermissionPreview permissions={formData.permissions} />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          
          <div className="flex gap-2">
            {activeTab !== 'preview' && (
              <Button variant="outline" onClick={() => setActiveTab('preview')}>
                Revisar
              </Button>
            )}
            <Button onClick={onSave} disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Perfil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileFormDialog;