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
import { useToast } from '@/hooks/use-toast';

interface ModulePermission {
  module: string;
  submodule?: string;
  permissions: {
    view: boolean;
    insert: boolean;
    edit: boolean;
    delete: boolean;
  };
}

interface AccessProfile {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermission[];
}

// Sample data - this would come from the database
const sampleProfiles: AccessProfile[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Acesso total ao sistema',
    permissions: []
  },
  {
    id: '2', 
    name: 'Pastor',
    description: 'Acesso pastoral completo',
    permissions: []
  }
];

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
  const [profiles, setProfiles] = useState<AccessProfile[]>(sampleProfiles);
  const [selectedProfile, setSelectedProfile] = useState<AccessProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: systemModules.map(module => ({
      module: module.name,
      permissions: { view: false, insert: false, edit: false, delete: false }
    }))
  });
  const { toast } = useToast();

  const handleCreateProfile = () => {
    // This would save to the database
    toast({
      title: "Perfil criado",
      description: "O perfil foi criado com sucesso!",
    });
  };

  const handleDuplicateProfile = (profile: AccessProfile) => {
    setFormData({
      name: `${profile.name} (Cópia)`,
      description: profile.description,
      permissions: profile.permissions
    });
  };

  const handlePermissionChange = (moduleIndex: number, permissionType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, index) => 
        index === moduleIndex 
          ? { ...perm, permissions: { ...perm.permissions, [permissionType]: checked } }
          : perm
      )
    }));
  };

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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Perfil</DialogTitle>
                  <DialogDescription>
                    Configure as permissões para o novo perfil
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
                      {systemModules.map((module, moduleIndex) => (
                        <Card key={module.name} className="p-4">
                          <h4 className="font-medium mb-3">{module.label}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['view', 'insert', 'edit', 'delete'].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${module.name}-${permission}`}
                                  checked={formData.permissions[moduleIndex]?.permissions[permission as 'view' | 'insert' | 'edit' | 'delete'] || false}
                                  onCheckedChange={(checked) => 
                                    handlePermissionChange(moduleIndex, permission, checked as boolean)
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
                    <Button onClick={handleCreateProfile} className="flex-1">
                      Criar Perfil
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
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>{profile.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Ativo</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDuplicateProfile(profile)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive">
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