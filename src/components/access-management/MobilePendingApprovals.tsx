import React, { useState } from 'react';
import { usePendingUsers, useApproveUser, useRejectUser } from '@/hooks/usePendingUsers';
import { useCongregations } from '@/hooks/useCongregationData';
import { useMinistries } from '@/hooks/useMinistryData';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Mail, MapPin, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileToast } from '@/hooks/useMobileToast';

const MobilePendingApprovals: React.FC = () => {
  const isMobile = useIsMobile();
  const { showMobileToast } = useMobileToast();
  const { data: pendingUsers, isLoading } = usePendingUsers();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  
  const { data: congregations } = useCongregations();
  const { data: ministries } = useMinistries();
  const { data: accessProfiles } = useAccessProfiles();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [approvalData, setApprovalData] = useState({
    profileId: '',
    congregationId: '',
    ministries: [] as string[]
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [allowReapply, setAllowReapply] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleApprove = async (userId: string, immediate?: boolean) => {
    try {
      if (immediate) {
        await approveUser.mutateAsync({ userId, profileId: '' });
        showMobileToast({ title: 'Usuário aprovado com sucesso', variant: 'default' });
      } else {
        setSelectedUser(pendingUsers?.find(u => u.id === userId));
        setIsApproveDialogOpen(true);
      }
    } catch (error) {
      showMobileToast({ title: 'Erro ao aprovar usuário', variant: 'destructive' });
    }
  };

  const handleReject = async (userId: string) => {
    setSelectedUser(pendingUsers?.find(u => u.id === userId));
    setIsRejectDialogOpen(true);
  };

  const handleApproveWithSettings = async () => {
    if (!selectedUser) return;
    
    try {
      await approveUser.mutateAsync({
        userId: selectedUser.id,
        profileId: approvalData.profileId,
        congregationId: approvalData.congregationId,
        ministries: approvalData.ministries
      });
      
      setIsApproveDialogOpen(false);
      setApprovalData({ profileId: '', congregationId: '', ministries: [] });
      showMobileToast({ title: 'Usuário aprovado com sucesso', variant: 'default' });
    } catch (error) {
      showMobileToast({ title: 'Erro ao aprovar usuário', variant: 'destructive' });
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUser) return;
    
    try {
      await rejectUser.mutateAsync({
        userId: selectedUser.id,
        rejectionReason,
        allowReapply
      });
      
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setAllowReapply(false);
      showMobileToast({ title: 'Usuário rejeitado', variant: 'default' });
    } catch (error) {
      showMobileToast({ title: 'Erro ao rejeitar usuário', variant: 'destructive' });
    }
  };

  const handleMinistryChange = (ministryId: string, checked: boolean) => {
    setApprovalData(prev => ({
      ...prev,
      ministries: checked 
        ? [...prev.ministries, ministryId]
        : prev.ministries.filter(id => id !== ministryId)
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários pendentes...</div>;
  }

  if (!pendingUsers || pendingUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum usuário pendente</h3>
        <p className="text-muted-foreground">Todas as solicitações foram processadas.</p>
      </div>
    );
  }

  const DialogComponent = isMobile ? Sheet : Dialog;
  const DialogContentComponent = isMobile ? SheetContent : DialogContent;
  const DialogHeaderComponent = isMobile ? SheetHeader : DialogHeader;
  const DialogTitleComponent = isMobile ? SheetTitle : DialogTitle;

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => {
        const congregation = congregations?.find(c => c.id === user.congregation_id);
        
        return (
          <MobileTableCard
            key={user.id}
            title={user.name}
            subtitle={user.email}
            status={{
              label: 'Pendente',
              variant: 'outline'
            }}
            fields={[
              {
                label: 'Congregação',
                value: congregation?.name || 'Não informada'
              },
              {
                label: 'Data de Registro',
                value: format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })
              },
              {
                label: 'Email',
                value: user.email
              }
            ]}
            actions={[
              {
                label: 'Aprovar',
                onClick: () => handleApprove(user.id, true),
                variant: 'default',
                icon: <Check className="h-4 w-4" />
              },
              {
                label: 'Configurar',
                onClick: () => handleApprove(user.id, false),
                variant: 'outline',
                icon: <UserCheck className="h-4 w-4" />
              },
              {
                label: 'Rejeitar',
                onClick: () => handleReject(user.id),
                variant: 'destructive',
                icon: <X className="h-4 w-4" />
              }
            ]}
          />
        );
      })}

      {/* Approve Dialog */}
      <DialogComponent open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContentComponent className={isMobile ? "w-full h-full" : "max-w-2xl"}>
          <DialogHeaderComponent>
            <DialogTitleComponent>Aprovar Usuário: {selectedUser?.name}</DialogTitleComponent>
          </DialogHeaderComponent>
          
          <div className="space-y-6 py-4">
            <div>
              <Label>Perfil de Acesso</Label>
              <Select 
                value={approvalData.profileId} 
                onValueChange={(value) => setApprovalData(prev => ({ ...prev, profileId: value }))}
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

            <div>
              <Label>Congregação</Label>
              <Select 
                value={approvalData.congregationId} 
                onValueChange={(value) => setApprovalData(prev => ({ ...prev, congregationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma congregação" />
                </SelectTrigger>
                <SelectContent>
                  {congregations?.map(congregation => (
                    <SelectItem key={congregation.id} value={congregation.id}>
                      {congregation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Ministérios</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                {ministries?.map(ministry => (
                  <div key={ministry.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={`ministry-${ministry.id}`}
                      checked={approvalData.ministries.includes(ministry.id)}
                      onCheckedChange={(checked) => handleMinistryChange(ministry.id, checked as boolean)}
                    />
                    <Label htmlFor={`ministry-${ministry.id}`} className="text-sm">
                      {ministry.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleApproveWithSettings} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContentComponent>
      </DialogComponent>

      {/* Reject Dialog */}
      <DialogComponent open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContentComponent className={isMobile ? "w-full h-full" : "max-w-lg"}>
          <DialogHeaderComponent>
            <DialogTitleComponent>Rejeitar Usuário: {selectedUser?.name}</DialogTitleComponent>
          </DialogHeaderComponent>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="min-h-20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-reapply"
                checked={allowReapply}
                onCheckedChange={(checked) => setAllowReapply(!!checked)}
              />
              <Label htmlFor="allow-reapply" className="text-sm">
                Permitir nova solicitação com o mesmo email
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="destructive" onClick={handleRejectUser} className="flex-1">
                <UserX className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContentComponent>
      </DialogComponent>
    </div>
  );
};

export default MobilePendingApprovals;