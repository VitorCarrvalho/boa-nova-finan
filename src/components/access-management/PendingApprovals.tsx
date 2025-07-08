import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import { usePendingUsers, useApproveUser, useRejectUser } from '@/hooks/usePendingUsers';
import { useCongregations } from '@/hooks/useCongregationData';
import { useMinistries } from '@/hooks/useMinistryData';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';

type UserRole = Database['public']['Enums']['user_role'];

const PendingApprovals = () => {
  const { data: pendingUsers, isLoading } = usePendingUsers();
  const { data: congregations } = useCongregations();
  const { data: ministries } = useMinistries();
  const { data: accessProfiles } = useAccessProfiles();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [approvalData, setApprovalData] = useState<{
    profileId: string;
    congregationId: string;
    ministries: string[];
  }>({
    profileId: '',
    congregationId: '',
    ministries: []
  });
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (userId: string, immediate = false) => {
    if (immediate) {
      // Get default profile ID (membro)
      const defaultProfile = accessProfiles?.find(p => p.name === 'membro');
      await approveUser.mutateAsync({
        userId,
        profileId: defaultProfile?.id || '',
      });
    } else {
      await approveUser.mutateAsync({
        userId,
        profileId: approvalData.profileId,
        congregationId: approvalData.congregationId || undefined,
        ministries: approvalData.ministries.length > 0 ? approvalData.ministries : undefined,
      });
      setSelectedUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    await rejectUser.mutateAsync({
      userId,
      rejectionReason
    });
    setRejectionReason('');
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    const defaultProfile = accessProfiles?.find(p => p.name === 'membro');
    setApprovalData({
      profileId: defaultProfile?.id || '',
      congregationId: user.congregation?.id || '',
      ministries: []
    });
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
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando usuários pendentes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Contas a Aprovar
        </CardTitle>
        <CardDescription>
          Usuários aguardando aprovação para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!pendingUsers || pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum usuário pendente de aprovação</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Congregação</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.congregation ? (
                        <Badge variant="outline">{user.congregation.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(user.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={approveUser.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Aprovar Usuário</DialogTitle>
                              <DialogDescription>
                                Configure o perfil e permissões para {user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Perfil</Label>
                                <Select
                                  value={approvalData.profileId}
                                  onValueChange={(profileId) => setApprovalData(prev => ({ ...prev, profileId }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o perfil" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {accessProfiles?.map((profile) => (
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
                                    <SelectValue placeholder="Selecione a congregação" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {congregations?.map((congregation) => (
                                      <SelectItem key={congregation.id} value={congregation.id}>
                                        {congregation.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>Ministérios</Label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {ministries?.map((ministry) => (
                                    <div key={ministry.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={ministry.id}
                                        checked={approvalData.ministries.includes(ministry.id)}
                                        onCheckedChange={(checked) => 
                                          handleMinistryChange(ministry.id, checked as boolean)
                                        }
                                      />
                                      <Label 
                                        htmlFor={ministry.id}
                                        className="text-sm font-normal"
                                      >
                                        {ministry.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => handleApprove(user.id)}
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                  disabled={approveUser.isPending}
                                >
                                  Aprovar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Rejeitar Usuário</DialogTitle>
                              <DialogDescription>
                                Rejeitar o acesso de {user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Motivo da rejeição (opcional)</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Descreva o motivo da rejeição..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(user.id)}
                                  disabled={rejectUser.isPending}
                                  className="flex-1"
                                >
                                  Rejeitar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
  );
};

export default PendingApprovals;