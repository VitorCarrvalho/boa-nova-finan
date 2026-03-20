import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, User, AlertTriangle, UserPlus } from 'lucide-react';
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
  access_profiles?: { name: string };
  congregations?: { name: string };
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

  // Create user state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', profileId: '', congregationId: '' });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['approved-users'],
    queryFn: async () => {
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_tenant_profiles', { _status: 'ativo' });

      if (profilesError) throw profilesError;

      const profileIds = (profilesData || []).map((p: any) => p.profile_id).filter(Boolean);
      const congIds = (profilesData || []).map((p: any) => p.congregation_id).filter(Boolean);

      let apMap: Record<string, any> = {};
      let congMap: Record<string, any> = {};

      if (profileIds.length > 0) {
        const { data: apData } = await supabase.from('access_profiles').select('id, name').in('id', profileIds);
        apData?.forEach((ap: any) => { apMap[ap.id] = ap; });
      }
      if (congIds.length > 0) {
        const { data: congData } = await supabase.from('congregations').select('id, name').in('id', congIds);
        congData?.forEach((c: any) => { congMap[c.id] = c; });
      }

      return (profilesData || []).map((p: any) => ({
        ...p,
        access_profiles: p.profile_id ? apMap[p.profile_id] || null : null,
        congregations: p.congregation_id ? congMap[p.congregation_id] || null : null,
      })) as Profile[];
    }
  });

  const { data: congregations } = useQuery({
    queryKey: ['congregations-for-mobile-user-form'],
    queryFn: async () => {
      const { data, error } = await supabase.from('congregations').select('id, name').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
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
    } catch {
      showMobileToast({ title: 'Erro ao atualizar usuário', variant: 'destructive' });
    }
  };

  const checkDependencies = async (userId: string) => {
    try {
      const deps = [];
      const { data: events } = await supabase.from('church_events').select('id, title').eq('organizer_id', userId);
      if (events && events.length > 0) deps.push({ type: 'Eventos organizados', count: events.length, items: events.map(e => e.title).slice(0, 3) });
      const { data: accounts } = await supabase.from('accounts_payable').select('id, description').eq('requested_by', userId);
      if (accounts && accounts.length > 0) deps.push({ type: 'Contas a pagar solicitadas', count: accounts.length, items: accounts.map(a => a.description).slice(0, 3) });
      return deps;
    } catch { return []; }
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
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
      if (error) throw error;
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setDependencies([]);
      refetch();
      showMobileToast({ title: 'Usuário excluído com sucesso', variant: 'default' });
    } catch {
      showMobileToast({ title: 'Erro ao excluir usuário', variant: 'destructive' });
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password || !createForm.profileId) {
      showMobileToast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    if (createForm.password.length < 6) {
      showMobileToast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
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

      showMobileToast({ title: `${createForm.name} adicionado com sucesso`, variant: 'default' });
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '', profileId: '', congregationId: '' });
      refetch();
    } catch (error: any) {
      showMobileToast({ title: error.message || 'Erro ao criar usuário', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Usuários do Sistema</h3>
            <p className="text-sm text-muted-foreground">Gerencie usuários aprovados</p>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1">
            <UserPlus className="h-4 w-4" />
            Novo
          </Button>
        </div>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground">Usuários aprovados aparecerão aqui.</p>
        </div>
        {/* Create Sheet rendered below */}
        {renderCreateSheet()}
      </div>
    );
  }

  function renderCreateSheet() {
    return (
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full h-auto">
          <SheetHeader>
            <SheetTitle>Novo Usuário</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do usuário" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Senha Temporária *</Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso *</Label>
              <Select value={createForm.profileId} onValueChange={(v) => setCreateForm(f => ({ ...f, profileId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                <SelectContent>
                  {accessProfiles?.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Congregação (opcional)</Label>
              <Select value={createForm.congregationId} onValueChange={(v) => setCreateForm(f => ({ ...f, congregationId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione uma congregação" /></SelectTrigger>
                <SelectContent>
                  {congregations?.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateUser} disabled={creating} className="flex-1">
                {creating ? 'Criando...' : 'Criar Usuário'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Usuários do Sistema</h3>
          <p className="text-sm text-muted-foreground">Gerencie usuários aprovados</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1">
          <UserPlus className="h-4 w-4" />
          Novo
        </Button>
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
              { label: 'Congregação', value: user.congregations?.name || 'Não informada' },
              { label: 'Perfil de Acesso', value: user.access_profiles?.name || 'Não definido' },
              { label: 'Criado em', value: format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) }
            ]}
            actions={[
              { label: 'Editar', onClick: () => handleEditUser(user), variant: 'outline', icon: <Edit className="h-4 w-4" /> },
              { label: 'Excluir', onClick: () => handleDeleteUser(user), variant: 'destructive', icon: <Trash2 className="h-4 w-4" /> }
            ]}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent className="w-full h-auto">
          <SheetHeader>
            <SheetTitle>Editar Usuário: {editingUser?.name}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Perfil de Acesso</label>
              <Select value={editFormData.profileId} onValueChange={(value) => setEditFormData({ profileId: value })}>
                <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                <SelectContent>
                  {accessProfiles?.map(profile => (<SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveUser} className="flex-1">Salvar</Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
                <p>Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?</p>
                {dependencies.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-2">⚠️ Este usuário possui dependências:</p>
                    {dependencies.map((dep, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{dep.type}: {dep.count}</p>
                        {dep.items.map((item: string, i: number) => (<p key={i} className="text-muted-foreground ml-2">• {item}</p>))}
                        {dep.count > 3 && (<p className="text-muted-foreground ml-2">... e mais {dep.count - 3}</p>)}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
            <AlertDialogCancel className={isMobile ? "w-full" : ""}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${isMobile ? "w-full" : ""}`}>
              Excluir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renderCreateSheet()}
    </div>
  );
};

export default MobileUserManagement;
