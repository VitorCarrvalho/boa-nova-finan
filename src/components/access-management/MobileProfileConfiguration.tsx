import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Copy, Trash2 } from 'lucide-react';
import { useAccessProfiles, useCreateAccessProfile, useUpdateAccessProfile, useDeleteAccessProfile } from '@/hooks/useAccessProfiles';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileToast } from '@/hooks/useMobileToast';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import ProfileTemplates from './ProfileTemplates';
import PermissionPreview from './PermissionPreview';
import PermissionValidator from './PermissionValidator';

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

const MobileProfileConfiguration: React.FC = () => {
  const isMobile = useIsMobile();
  const { showMobileToast } = useMobileToast();
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    setSelectedProfile(null);
  };

  const handleSaveProfile = async () => {
    try {
      if (isEditing && selectedProfile) {
        await updateProfile.mutateAsync({
          id: selectedProfile.id,
          updates: {
            name: formData.name,
            description: formData.description,
            permissions: formData.permissions
          }
        });
        showMobileToast({ title: 'Perfil atualizado com sucesso', variant: 'default' });
      } else {
        await createProfile.mutateAsync({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions
        });
        showMobileToast({ title: 'Perfil criado com sucesso', variant: 'default' });
      }
      
      resetForm();
      setIsSheetOpen(false);
    } catch (error) {
      showMobileToast({ title: 'Erro ao salvar perfil', variant: 'destructive' });
    }
  };

  const handleEditProfile = (profile: any) => {
    setSelectedProfile(profile);
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
    setIsSheetOpen(true);
  };

  const handleCreateNewProfile = () => {
    resetForm();
    setIsSheetOpen(true);
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
    setIsSheetOpen(true);
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

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deleteProfile.mutateAsync(profileId);
      showMobileToast({ title: 'Perfil excluído com sucesso', variant: 'default' });
    } catch (error) {
      showMobileToast({ title: 'Erro ao excluir perfil', variant: 'destructive' });
    }
  };

  const getPermissionCount = (permissions: any) => {
    if (!permissions) return 0;
    
    let count = 0;
    Object.values(permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'boolean' && modulePerms) {
        count++;
      } else if (typeof modulePerms === 'object' && modulePerms !== null) {
        Object.values(modulePerms).forEach((value) => {
          if (typeof value === 'boolean' && value) {
            count++;
          } else if (typeof value === 'object' && value !== null) {
            count += Object.values(value as Record<string, boolean>).filter(Boolean).length;
          }
        });
      }
    });
    return count;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando perfis...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Perfis de Acesso</h3>
          <p className="text-sm text-muted-foreground">Gerencie permissões por perfil</p>
        </div>
        
        <Button onClick={handleCreateNewProfile} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>

      <div className="space-y-3">
        {profiles?.map((profile) => (
          <MobileTableCard
            key={profile.id}
            title={profile.name}
            subtitle={profile.description}
            status={{
              label: profile.is_active ? 'Ativo' : 'Inativo',
              variant: profile.is_active ? 'default' : 'secondary'
            }}
            fields={[
              {
                label: 'Permissões',
                value: `${getPermissionCount(profile.permissions)} configuradas`
              },
              {
                label: 'Criado em',
                value: new Date(profile.created_at).toLocaleDateString('pt-BR')
              }
            ]}
            actions={[
              {
                label: 'Editar',
                onClick: () => handleEditProfile(profile),
                variant: 'outline',
                icon: <Edit className="h-4 w-4" />
              },
              {
                label: 'Duplicar',
                onClick: () => handleDuplicateProfile(profile),
                variant: 'outline',
                icon: <Copy className="h-4 w-4" />
              },
              {
                label: 'Excluir',
                onClick: () => handleDeleteProfile(profile.id),
                variant: 'destructive',
                icon: <Trash2 className="h-4 w-4" />
              }
            ]}
          />
        ))}
      </div>

      {/* Mobile Sheet for Form */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) resetForm();
      }}>
        <SheetContent className="w-full h-full overflow-y-auto" side="bottom">
          <SheetHeader className="pb-4">
            <SheetTitle>{isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
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
              <h3 className="text-lg font-medium mb-4">Permissões por Módulo</h3>
              
              <Accordion type="multiple" className="w-full space-y-2">
                {systemModules.map((module) => (
                  <AccordionItem key={module.name} value={module.name} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span className="font-medium">{module.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {module.actions.length + module.subModules.reduce((acc, sub) => acc + sub.actions.length, 0)} ações
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        {/* Module-level actions */}
                        <div>
                          <div className="text-sm font-medium mb-2">Ações Gerais:</div>
                          <div className="grid grid-cols-2 gap-3">
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
                                   action === 'export' ? 'Exportar' :
                                   action === 'send_notification' ? 'Notificar' : action}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Submodules */}
                        {module.subModules.map((subModule) => (
                          <div key={subModule.name} className="border-l-2 border-muted pl-4">
                            <div className="text-sm font-medium mb-2">{subModule.label}:</div>
                            <div className="grid grid-cols-2 gap-3">
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
                                    {action === 'view' ? 'Visualizar' :
                                     action === 'insert' ? 'Incluir' :
                                     action === 'edit' ? 'Editar' :
                                     action === 'delete' ? 'Remover' :
                                     action === 'submit' ? 'Enviar' :
                                     action === 'approve' ? 'Aprovar' :
                                     action === 'export' ? 'Exportar' :
                                     action === 'send_notification' ? 'Notificar' : action}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="flex gap-2 pt-4 pb-8">
              <Button onClick={handleSaveProfile} className="flex-1">
                {isEditing ? 'Atualizar' : 'Criar'} Perfil
              </Button>
              <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileProfileConfiguration;