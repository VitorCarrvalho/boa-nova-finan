import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { useTenantUsers } from '@/hooks/useTenantUsers';

interface TenantUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  onSuccess: () => void;
}

const TenantUserFormDialog: React.FC<TenantUserFormDialogProps> = ({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  onSuccess,
}) => {
  const { createUser, creating } = useTenantUsers(tenantId);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'owner' | 'admin' | 'manager',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createUser(formData);
    
    if (success) {
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      onSuccess();
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Administrador
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Criar novo administrador para {tenantName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: João Silva"
              required
              disabled={creating}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Ex: joao@igreja.com"
              required
              disabled={creating}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Senha Temporária</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              disabled={creating}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-500">
              O usuário poderá alterar a senha após o primeiro login.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">Perfil de Acesso</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'owner' | 'admin' | 'manager') => 
                setFormData(prev => ({ ...prev, role: value }))
              }
              disabled={creating}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="owner" className="text-white hover:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Owner</span>
                    <span className="text-xs text-slate-400">Acesso total ao tenant</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Admin</span>
                    <span className="text-xs text-slate-400">Gerencia usuários e configurações</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager" className="text-white hover:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">Manager</span>
                    <span className="text-xs text-slate-400">Gerencia operações do dia-a-dia</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={creating}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantUserFormDialog;
