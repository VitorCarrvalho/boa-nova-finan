import React, { useState } from 'react';
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
                    <h3 className="text-lg font-medium mb-4">Permissões por Módulo</h3>
                    <div className="space-y-4">
                      {systemModules.map((module) => (
                        <Card key={module.name} className="p-4">
                          <h4 className="font-medium mb-3">{module.label}</h4>
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