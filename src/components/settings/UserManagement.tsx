
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AccessProfileDropdown from './AccessProfileDropdown';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Save, X, Trash2, UserPlus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UserManagement = () => {
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['approvedUsers'],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_tenant_profiles', { _status: 'ativo' });

      if (profilesError) throw profilesError;

      const profileIds = (profilesData || [])
        .map((p: any) => p.profile_id)
        .filter(Boolean);

      let accessProfilesMap: Record<string, any> = {};
      if (profileIds.length > 0) {
        const { data: apData } = await supabase
          .from('access_profiles')
          .select('id, name, description')
          .in('id', profileIds);

        if (apData) {
          apData.forEach((ap: any) => {
            accessProfilesMap[ap.id] = ap;
          });
        }
      }

      return (profilesData || []).map((p: any) => ({
        ...p,
        access_profiles: p.profile_id ? accessProfilesMap[p.profile_id] || null : null,
      }));
    },
  });

  const { data: accessProfiles } = useAccessProfiles();
  const { data: congregations } = useQuery({
    queryKey: ['congregations-for-user-form'],
    queryFn: async () => {
      const { data, error } = await supabase.from('congregations').select('id, name').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });

  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ profileId: string | null }>({ profileId: null });
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);

  // Create user state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    profileId: '',
    congregationId: '',
  });

  const handleEditUser = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({ profileId: user.profile_id });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('assign_unique_profile' as any, {
          _user_id: userId,
          _profile_id: editForm.profileId
        });

      if (error) throw error;

      toast({ title: "Usuário atualizado", description: "Perfil atribuído com sucesso!" });
      setEditingUser(null);
      refetch();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ profileId: null });
  };

  const checkDependencies = async (userId: string) => {
    try {
      const deps = [];
      const { data: events } = await supabase.from('church_events').select('count').eq('organizer_id', userId);
      if (events && events.length > 0) deps.push(`${events.length} evento(s) organizados`);
      const { data: accounts } = await supabase.from('accounts_payable').select('count').eq('requested_by', userId);
      if (accounts && accounts.length > 0) deps.push(`${accounts.length} conta(s) a pagar solicitadas`);
      return deps;
    } catch { return []; }
  };

  const handleDeleteUser = async (user: Profile) => {
    const currentUser = await supabase.auth.getUser();
    if (currentUser.data.user?.id === user.id) {
      toast({ title: "Erro", description: "Você não pode excluir seu próprio usuário.", variant: "destructive" });
      return;
    }
    setDeletingUser(user.id);
    const deps = await checkDependencies(user.id);
    setDependencies(deps);
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
    setDeletingUser(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
      if (error) throw error;
      toast({ title: "Usuário excluído", description: "O usuário foi removido com sucesso." });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      setDependencies([]);
      refetch();
    } catch (error: any) {
      toast({ title: "Erro ao excluir usuário", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password || !createForm.profileId) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (createForm.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-org-user', {
        body: {
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          profileId: createForm.profileId,
          congregationId: createForm.congregationId || undefined,
        },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Erro ao criar usuário');

      toast({ title: "Usuário criado", description: `${createForm.name} foi adicionado com sucesso.` });
      setCreateDialogOpen(false);
      setCreateForm({ name: '', email: '', password: '', profileId: '', congregationId: '' });
      refetch();
    } catch (error: any) {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando usuários...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Gerencie usuários aprovados e seus perfis de acesso</CardDescription>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                {editingUser === user.id ? (
                  <div>
                    <Label htmlFor={`profile-${user.id}`}>Perfil de Acesso</Label>
                    <AccessProfileDropdown
                      value={editForm.profileId}
                      onValueChange={(profileId) => setEditForm({ profileId })}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-sm text-primary">
                      {user.access_profiles?.name || 'Sem perfil atribuído'}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingUser === user.id ? (
                  <>
                    <Button size="sm" onClick={() => handleSaveUser(user.id)} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user)}
                      disabled={deletingUser === user.id}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {deletingUser === user.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O usuário "{userToDelete?.name}" será permanentemente removido do sistema.
                {dependencies.length > 0 && (
                  <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                    <strong className="text-destructive">Atenção:</strong> Este usuário possui registros relacionados:
                    <ul className="mt-2 list-disc list-inside text-sm">
                      {dependencies.map((dep, index) => (
                        <li key={index}>{dep}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">A exclusão do usuário pode afetar esses registros.</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90">
                Excluir Usuário
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Senha Temporária *</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label>Perfil de Acesso *</Label>
                <Select
                  value={createForm.profileId}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, profileId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessProfiles?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Congregação (opcional)</Label>
                <Select
                  value={createForm.congregationId}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, congregationId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma congregação" />
                  </SelectTrigger>
                  <SelectContent>
                    {congregations?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleCreateUser} disabled={creating} className="flex-1">
                  {creating ? 'Criando...' : 'Criar Usuário'}
                </Button>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
