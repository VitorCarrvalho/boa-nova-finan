
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AccessProfileDropdown from './AccessProfileDropdown';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Save, X, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UserManagement = () => {
  // Only show approved users with access profiles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['approvedUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_profiles:profile_id (
            id,
            name,
            description
          )
        `)
        .eq('approval_status', 'ativo')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ profileId: string | null }>({
    profileId: null
  });
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);

  const handleEditUser = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({
      profileId: user.profile_id
    });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      // Usar a nova função para atribuir perfil único
      const { data, error } = await supabase
        .rpc('assign_unique_profile' as any, {
          _user_id: userId,
          _profile_id: editForm.profileId
        });

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "Perfil atribuído com sucesso! As permissões foram atualizadas.",
      });

      setEditingUser(null);
      refetch();
      
      // Força refresh da página para recarregar permissões
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ profileId: null });
  };

  const checkDependencies = async (userId: string) => {
    try {
      const dependencies = [];
      
      // Check for organized events
      const { data: events, error: eventsError } = await supabase
        .from('church_events')
        .select('count')
        .eq('organizer_id', userId);
      
      if (eventsError) throw eventsError;
      if (events && events.length > 0) {
        dependencies.push(`${events.length} evento(s) organizados`);
      }
      
      // Check for accounts payable requests
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts_payable')
        .select('count')
        .eq('requested_by', userId);
      
      if (accountsError) throw accountsError;
      if (accounts && accounts.length > 0) {
        dependencies.push(`${accounts.length} conta(s) a pagar solicitadas`);
      }
      
      return dependencies;
    } catch (error) {
      console.error('Erro ao verificar dependências:', error);
      return [];
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    // Don't allow self-deletion
    const currentUser = await supabase.auth.getUser();
    if (currentUser.data.user?.id === user.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir seu próprio usuário.",
        variant: "destructive",
      });
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
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });

      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      setDependencies([]);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
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
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Gerencie usuários aprovados e seus perfis de acesso
        </CardDescription>
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
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-blue-600">
                      {user.access_profiles?.name || 'Sem perfil atribuído'}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingUser === user.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSaveUser(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      A exclusão do usuário pode afetar esses registros.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteUser}
                className="bg-destructive hover:bg-destructive/90"
              >
                Excluir Usuário
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
