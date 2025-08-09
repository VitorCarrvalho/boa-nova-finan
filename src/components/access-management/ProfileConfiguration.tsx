import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Copy, Trash2, AlertCircle } from 'lucide-react';
import { useAccessProfiles, useCreateAccessProfile, useUpdateAccessProfile, useDeleteAccessProfile } from '@/hooks/useAccessProfiles';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';
import ProfileFormDialog from './ProfileFormDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<any>(null);

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

  const handleDeleteClick = (profile: any) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    
    try {
      await deleteProfile.mutateAsync(profileToDelete.id);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando perfis de acesso...</div>
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
              <CardTitle className="flex items-center gap-2">
                Configuração de Perfis de Acesso
                <Badge variant="secondary" className="text-xs">
                  {profiles?.length || 0} perfis
                </Badge>
              </CardTitle>
              <CardDescription>
                Gerencie perfis de acesso e configure permissões granulares para diferentes tipos de usuários
              </CardDescription>
            </div>
            <Button onClick={handleCreateNewProfile} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!profiles || profiles.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum perfil de acesso encontrado. Crie um novo perfil para começar a gerenciar permissões.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id} className="group">
                      <TableCell>
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {profile.id.slice(0, 8)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {profile.description || 'Sem descrição'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getPermissionCount(profile.permissions)} ações
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {Object.keys(profile.permissions || {}).filter(key => 
                              Object.values((profile.permissions || {})[key] || {}).some((val: any) => {
                                if (typeof val === 'boolean') return val;
                                if (typeof val === 'object' && val !== null) {
                                  return Object.values(val).some(Boolean);
                                }
                                return false;
                              })
                            ).length} módulos
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                          {profile.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProfile(profile)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateProfile(profile)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(profile)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveProfile}
        isEditing={isEditing}
        isLoading={createProfile.isPending || updateProfile.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o perfil "{profileToDelete?.name}"? 
              Esta ação não pode ser desfeita e pode afetar usuários que utilizam este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileConfiguration;