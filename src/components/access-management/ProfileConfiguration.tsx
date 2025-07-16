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

interface ModulePermission {
  module: string;
  permissions: {
    view: boolean;
    insert: boolean;
    edit: boolean;
    delete: boolean;
  };
}

// System modules configuration
const systemModules = [
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'financeiro', label: 'Financeiro' },
  { name: 'membros', label: 'Membros' },
  { name: 'eventos', label: 'Eventos' },
  { name: 'congregacoes', label: 'Congregações' },
  { name: 'ministerios', label: 'Ministérios' },
  { name: 'departamentos', label: 'Departamentos' },
  { name: 'fornecedores', label: 'Fornecedores' },
  { name: 'relatorios', label: 'Relatórios' },
  { name: 'notificacoes', label: 'Notificações' },
  { name: 'conciliacoes', label: 'Conciliações' },
  { name: 'contas-pagar', label: 'Contas a Pagar' },
];

const ProfileConfiguration = () => {
  const { data: profiles, isLoading } = useAccessProfiles();
  const createProfile = useCreateAccessProfile();
  const updateProfile = useUpdateAccessProfile();
  const deleteProfile = useDeleteAccessProfile();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: systemModules.reduce((acc, module) => ({
      ...acc,
      [module.name]: { view: false, insert: false, edit: false, delete: false }
    }), {} as Record<string, any>)
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
      permissions: systemModules.reduce((acc, module) => ({
        ...acc,
        [module.name]: { view: false, insert: false, edit: false, delete: false }
      }), {} as Record<string, any>)
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
    setFormData({
      name: profile.name,
      description: profile.description || '',
      permissions: profile.permissions || systemModules.reduce((acc, module) => ({
        ...acc,
        [module.name]: { view: false, insert: false, edit: false, delete: false }
      }), {} as Record<string, any>)
    });
    setIsDialogOpen(true);
  };

  const handleCreateNewProfile = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDuplicateProfile = (profile: any) => {
    resetForm();
    setFormData({
      name: `${profile.name} (Cópia)`,
      description: profile.description || '',
      permissions: profile.permissions || systemModules.reduce((acc, module) => ({
        ...acc,
        [module.name]: { view: false, insert: false, edit: false, delete: false }
      }), {} as Record<string, any>)
    });
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (moduleName: string, permissionType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [permissionType]: checked
        }
      }
    }));
  };

  // Calculate global state (all permissions across all modules)
  const calculateGlobalState = () => {
    const allPermissions = systemModules.flatMap(module => 
      ['view', 'insert', 'edit', 'delete'].map(action => 
        formData.permissions[module.name]?.[action] || false
      )
    );
    
    const checkedCount = allPermissions.filter(Boolean).length;
    const totalCount = allPermissions.length;
    
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === totalCount) return 'checked';
    return 'indeterminate';
  };

  // Calculate module state (all actions within a module)
  const calculateModuleState = (moduleName: string) => {
    const actions = ['view', 'insert', 'edit', 'delete'];
    const modulePermissions = actions.map(action => 
      formData.permissions[moduleName]?.[action] || false
    );
    
    const checkedCount = modulePermissions.filter(Boolean).length;
    const totalCount = modulePermissions.length;
    
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
      newPermissions[module.name] = {
        view: shouldCheck,
        insert: shouldCheck,
        edit: shouldCheck,
        delete: shouldCheck
      };
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
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          view: shouldCheck,
          insert: shouldCheck,
          edit: shouldCheck,
          delete: shouldCheck
        }
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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['view', 'insert', 'edit', 'delete'].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${module.name}-${permission}`}
                                  checked={formData.permissions[module.name]?.[permission] || false}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(module.name, permission, checked as boolean)
                                  }
                                />
                                <Label 
                                  htmlFor={`${module.name}-${permission}`}
                                  className="text-sm"
                                >
                                  {permission === 'view' ? 'Visualizar' :
                                   permission === 'insert' ? 'Incluir' :
                                   permission === 'edit' ? 'Editar' : 'Remover'}
                                </Label>
                              </div>
                            ))}
                          </div>
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