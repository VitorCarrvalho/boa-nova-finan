import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Copy, Trash2 } from 'lucide-react';
import { useAccessProfiles, useCreateAccessProfile, useUpdateAccessProfile, useDeleteAccessProfile } from '@/hooks/useAccessProfiles';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';

interface ModulePermission {
  module: string;
  permissions: {
    view: boolean;
    insert: boolean;
    edit: boolean;
    delete: boolean;
  };
}

// Use dynamic modules from structure instead of hardcoded
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

const ProfileConfiguration = () => {
  const { data: profiles, isLoading } = useAccessProfiles();
  const createProfile = useCreateAccessProfile();
  const updateProfile = useUpdateAccessProfile();
  const deleteProfile = useDeleteAccessProfile();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: systemModules.reduce((acc, module) => {
      const modulePermissions = module.actions.reduce((modAcc, action) => ({
        ...modAcc,
        [action]: false
      }), {} as Record<string, boolean>);

      const subModulePermissions = module.subModules.reduce((subAcc, subModule) => ({
        ...subAcc,
        [subModule.name]: subModule.actions.reduce((subModAcc, action) => ({
          ...subModAcc,
          [action]: false
        }), {} as Record<string, boolean>)
      }), {} as Record<string, any>);

      return {
        ...acc,
        [module.name]: {
          ...modulePermissions,
          ...subModulePermissions
        }
      };
    }, {} as Record<string, any>)
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  
  // Refs for indeterminate state
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: systemModules.reduce((acc, module) => {
        const modulePermissions = module.actions.reduce((modAcc, action) => ({
          ...modAcc,
          [action]: false
        }), {} as Record<string, boolean>);

        const subModulePermissions = module.subModules.reduce((subAcc, subModule) => ({
          ...subAcc,
          [subModule.name]: subModule.actions.reduce((subModAcc, action) => ({
            ...subModAcc,
            [action]: false
          }), {} as Record<string, boolean>)
        }), {} as Record<string, any>);

        return {
          ...acc,
          [module.name]: {
            ...modulePermissions,
            ...subModulePermissions
          }
        };
      }, {} as Record<string, any>)
    });
    setIsEditing(false);
    setEditingProfile(null);
  };

  const handleSaveProfile = async () => {
    try {
      if (isEditing && editingProfile) {
        await updateProfile.mutateAsync({
          id: editingProfile.id,
          updates: {
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          }
        });
      } else {
        await createProfile.mutateAsync({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setIsEditing(true);
    
    const defaultPermissions = systemModules.reduce((acc, module) => {
      const modulePermissions = module.actions.reduce((modAcc, action) => ({
        ...modAcc,
        [action]: false
      }), {} as Record<string, boolean>);

      const subModulePermissions = module.subModules.reduce((subAcc, subModule) => ({
        ...subAcc,
        [subModule.name]: subModule.actions.reduce((subModAcc, action) => ({
          ...subModAcc,
          [action]: false
        }), {} as Record<string, boolean>)
      }), {} as Record<string, any>);

      return {
        ...acc,
        [module.name]: {
          ...modulePermissions,
          ...subModulePermissions
        }
      };
    }, {} as Record<string, any>);

    setFormData({
      name: profile.name,
      description: profile.description || '',
      permissions: profile.permissions || defaultPermissions
    });
    setIsDialogOpen(true);
  };

  const handleCreateNewProfile = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDuplicateProfile = (profile: any) => {
    resetForm();
    
    const defaultPermissions = systemModules.reduce((acc, module) => {
      const modulePermissions = module.actions.reduce((modAcc, action) => ({
        ...modAcc,
        [action]: false
      }), {} as Record<string, boolean>);

      const subModulePermissions = module.subModules.reduce((subAcc, subModule) => ({
        ...subAcc,
        [subModule.name]: subModule.actions.reduce((subModAcc, action) => ({
          ...subModAcc,
          [action]: false
        }), {} as Record<string, boolean>)
      }), {} as Record<string, any>);

      return {
        ...acc,
        [module.name]: {
          ...modulePermissions,
          ...subModulePermissions
        }
      };
    }, {} as Record<string, any>);

    setFormData({
      name: `${profile.name} (Cópia)`,
      description: profile.description || '',
      permissions: profile.permissions || defaultPermissions
    });
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (moduleName: string, permissionType: string, checked: boolean, subModuleName?: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [subModuleName || permissionType]: subModuleName ? {
            ...prev.permissions[moduleName][subModuleName],
            [permissionType]: checked
          } : checked
        }
      }
    }));
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
    
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
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
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: newModulePermissions
      }
    }));
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deleteProfile.mutateAsync(profileId);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando perfis...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuração de Perfis</CardTitle>
              <CardDescription>
                Gerencie perfis de acesso e suas permissões
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNewProfile}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? 'Atualize as permissões do perfil' : 'Configure as permissões para o novo perfil'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Perfil</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Analista, Gerente..."
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva as responsabilidades deste perfil"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Permissões por Módulo</h3>
                      <div className="flex items-center space-x-2 bg-primary/5 p-2 rounded-lg">
                        <Checkbox
                          id="select-all-global"
                          checked={calculateGlobalState() === 'checked'}
                          ref={globalCheckboxRef}
                          onCheckedChange={handleSelectAllGlobal}
                        />
                        <Label htmlFor="select-all-global" className="text-sm font-medium text-primary">
                          ✨ Selecionar Todos
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {systemModules.map((module) => (
                        <Card key={module.name} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{module.label}</h4>
                            <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded">
                              <Checkbox
                                id={`select-all-${module.name}`}
                                checked={calculateModuleState(module.name) === 'checked'}
                                ref={(ref) => {
                                  moduleCheckboxRefs.current[module.name] = ref;
                                }}
                                onCheckedChange={() => handleSelectAllModule(module.name)}
                              />
                              <Label htmlFor={`select-all-${module.name}`} className="text-xs font-medium">
                                Todos
                              </Label>
                            </div>
                          </div>
                          
                          {/* Module-level actions */}
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Ações Gerais:</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    {action === 'view' ? 'Visualizar' :
                                     action === 'insert' ? 'Incluir' :
                                     action === 'edit' ? 'Editar' :
                                     action === 'delete' ? 'Remover' :
                                     action === 'submit' ? 'Enviar' :
                                     action === 'approve' ? 'Aprovar' :
                                     action === 'reject' ? 'Reprovar' :
                                     action === 'export' ? 'Exportar' :
                                     action === 'inactivate' ? 'Inativar' :
                                     action === 'send_notification' ? 'Enviar Notificação' : action}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Submodules */}
                          {module.subModules.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-sm font-medium">Submódulos:</div>
                              {module.subModules.map((subModule) => (
                                <div key={subModule.name} className="border rounded p-3 bg-gray-50">
                                  <div className="text-sm font-medium mb-2">{subModule.label}:</div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                                          className="text-xs"
                                        >
                                          {action === 'view' ? 'Ver' :
                                           action === 'insert' ? 'Incluir' :
                                           action === 'edit' ? 'Editar' :
                                           action === 'delete' ? 'Remover' :
                                           action === 'approve' ? 'Aprovar' :
                                           action === 'export' ? 'Exportar' : action}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      className="flex-1"
                      disabled={createProfile.isPending || updateProfile.isPending}
                    >
                      {createProfile.isPending || updateProfile.isPending ? 
                        (isEditing ? 'Atualizando...' : 'Criando...') : 
                        (isEditing ? 'Atualizar Perfil' : 'Criar Perfil')
                      }
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>{profile.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Ativo</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProfile(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDuplicateProfile(profile)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteProfile(profile.id)}
                          disabled={deleteProfile.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileConfiguration;