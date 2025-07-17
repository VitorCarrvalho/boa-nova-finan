import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, Shield, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileToast } from '@/hooks/useMobileToast';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_id: string;
  congregation_id: string;
  approval_status: string;
  created_at: string;
  access_profiles?: {
    name: string;
  };
  congregations?: {
    name: string;
  };
}

const MobileUserManagement: React.FC = () => {
  const isMobile = useIsMobile();
  const { showMobileToast } = useMobileToast();
  const { data: accessProfiles } = useAccessProfiles();

  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editFormData, setEditFormData] = useState({ profileId: '' });
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch approved users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['approved-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_profiles:profile_id(name),
          congregations:congregation_id(name)
        `)
        .eq('approval_status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    }
  });

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setEditFormData({ profileId: user.profile_id || '' });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_id: editFormData.profileId })
        .eq('id', editingUser.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      setEditingUser(null);
      refetch();
      showMobileToast({ title: 'Usuário atualizado com sucesso', variant: 'default' });
    } catch (error) {
      showMobileToast({ title: 'Erro ao atualizar usuário', variant: 'destructive' });
    }
  };

  const checkDependencies = async (userId: string) => {
    try {
      const dependencies = [];

      // Check organized events
      const { data: events } = await supabase
        .from('church_events')
        .select('id, title')
        .eq('organizer_id', userId);
      
      if (events && events.length > 0) {
        dependencies.push({
          type: 'Eventos organizados',
          count: events.length,
          items: events.map(e => e.title).slice(0, 3)
        });
      }

      // Check accounts payable requests
      const { data: accounts } = await supabase
        .from('accounts_payable')
        .select('id, description')
        .eq('requested_by', userId);
      
      if (accounts && accounts.length > 0) {
        dependencies.push({
          type: 'Contas a pagar solicitadas',
          count: accounts.length,
          items: accounts.map(a => a.description).slice(0, 3)
        });
      }

      return dependencies;
    } catch (error) {
      console.error('Error checking dependencies:', error);
      return [];
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    const deps = await checkDependencies(user.id);
    setDependencies(deps);
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setDependencies([]);
      refetch();
      showMobileToast({ title: 'Usuário excluído com sucesso', variant: 'default' });
    } catch (error) {
      showMobileToast({ title: 'Erro ao excluir usuário', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
        <p className="text-muted-foreground">Usuários aprovados aparecerão aqui.</p>
      </div>
    );
  }

  const DialogComponent = isMobile ? Sheet : Dialog;
  const DialogContentComponent = isMobile ? SheetContent : DialogContent;
  const DialogHeaderComponent = isMobile ? SheetHeader : DialogHeader;
  const DialogTitleComponent = isMobile ? SheetTitle : DialogTitle;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Usuários do Sistema</h3>
        <p className="text-sm text-muted-foreground">Gerencie usuários aprovados</p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <MobileTableCard
            key={user.id}
            title={user.name}
            subtitle={user.email}
            status={{
              label: user.access_profiles?.name || 'Sem perfil',
              variant: user.access_profiles?.name ? 'default' : 'secondary'
            }}
            fields={[
              {
                label: 'Congregação',
                value: user.congregations?.name || 'Não informada'
              },
              {
                label: 'Perfil de Acesso',
                value: user.access_profiles?.name || 'Não definido'
              },
              {
                label: 'Criado em',
                value: format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
              }
            ]}
            actions={[
              {
                label: 'Editar',
                onClick: () => handleEditUser(user),
                variant: 'outline',
                icon: <Edit className="h-4 w-4" />
              },
              {
                label: 'Excluir',
                onClick: () => handleDeleteUser(user),
                variant: 'destructive',
                icon: <Trash2 className="h-4 w-4" />
              }
            ]}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <DialogComponent open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContentComponent className={isMobile ? "w-full h-auto" : "max-w-md"}>
          <DialogHeaderComponent>
            <DialogTitleComponent>Editar Usuário: {editingUser?.name}</DialogTitleComponent>
          </DialogHeaderComponent>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Perfil de Acesso</label>
              <Select 
                value={editFormData.profileId} 
                onValueChange={(value) => setEditFormData({ profileId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {accessProfiles?.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveUser} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContentComponent>
      </DialogComponent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isMobile ? "w-[95%] rounded-lg" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <div className="space-y-3">
                <p>
                  Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
                </p>
                
                {dependencies.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-2">
                      ⚠️ Este usuário possui dependências:
                    </p>
                    {dependencies.map((dep, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{dep.type}: {dep.count}</p>
                        {dep.items.map((item: string, i: number) => (
                          <p key={i} className="text-muted-foreground ml-2">• {item}</p>
                        ))}
                        {dep.count > 3 && (
                          <p className="text-muted-foreground ml-2">... e mais {dep.count - 3}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
            <AlertDialogCancel className={isMobile ? "w-full" : ""}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${isMobile ? "w-full" : ""}`}
            >
              Excluir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MobileUserManagement;