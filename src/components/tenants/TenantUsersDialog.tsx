import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, MoreHorizontal, Trash2, Shield, Users } from 'lucide-react';
import { useTenantUsers, TenantUser } from '@/hooks/useTenantUsers';
import TenantUserFormDialog from './TenantUserFormDialog';

interface TenantUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  manager: 'outline',
};

const TenantUsersDialog: React.FC<TenantUsersDialogProps> = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
}) => {
  const { users, loading, fetchUsers, updateUserRole, removeUser } = useTenantUsers(tenantId);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);

  useEffect(() => {
    if (open && tenantId) {
      fetchUsers();
    }
  }, [open, tenantId, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: 'owner' | 'admin' | 'manager') => {
    await updateUserRole(userId, newRole);
  };

  const handleDeleteClick = (user: TenantUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await removeUser(selectedUser.user_id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários - {tenantName}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Gerencie os administradores deste tenant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setFormOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Admin
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum administrador cadastrado.</p>
                <p className="text-sm mt-1">Clique em "Adicionar Admin" para começar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Perfil</TableHead>
                    <TableHead className="text-slate-300 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {user.user.name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariants[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.user_id, 'owner')}
                              className="text-white hover:bg-slate-700"
                              disabled={user.role === 'owner'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Tornar Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.user_id, 'admin')}
                              className="text-white hover:bg-slate-700"
                              disabled={user.role === 'admin'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Tornar Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(user.user_id, 'manager')}
                              className="text-white hover:bg-slate-700"
                              disabled={user.role === 'manager'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Tornar Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-400 hover:bg-slate-700 hover:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TenantUserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tenantId={tenantId}
        tenantName={tenantName}
        onSuccess={() => {
          setFormOpen(false);
          fetchUsers();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja remover <strong className="text-white">{selectedUser?.user.name}</strong> do tenant?
              Esta ação removerá apenas o acesso administrativo ao tenant, não excluirá a conta do usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TenantUsersDialog;
