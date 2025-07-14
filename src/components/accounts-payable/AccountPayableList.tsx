import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountPayable, useApproveAccount, useRejectAccount, useMarkAsPaid } from '@/hooks/useAccountsPayable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Check, X, Upload, AlertTriangle } from 'lucide-react';
import AccountPayableDetails from './AccountPayableDetails';

interface AccountPayableListProps {
  accounts: AccountPayable[];
  isLoading: boolean;
  showActions?: boolean;
  showApprovalActions?: boolean;
  showPaymentActions?: boolean;
}

const AccountPayableList: React.FC<AccountPayableListProps> = ({
  accounts,
  isLoading,
  showActions = true,
  showApprovalActions = false,
  showPaymentActions = false,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<AccountPayable | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [accountToReject, setAccountToReject] = useState<AccountPayable | null>(null);

  const approveMutation = useApproveAccount();
  const rejectMutation = useRejectAccount();
  const markAsPaidMutation = useMarkAsPaid();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending_management: { label: 'Pend. Gerência', variant: 'secondary' as const },
      pending_director: { label: 'Pend. Diretoria', variant: 'secondary' as const },
      pending_president: { label: 'Pend. Presidência', variant: 'secondary' as const },
      approved: { label: 'Aprovado', variant: 'default' as const },
      paid: { label: 'Pago', variant: 'default' as const },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getApprovalLevel = (status: string) => {
    switch (status) {
      case 'pending_management': return 'management';
      case 'pending_director': return 'director';
      case 'pending_president': return 'president';
      default: return null;
    }
  };

  const handleApprove = (account: AccountPayable) => {
    const level = getApprovalLevel(account.status);
    if (level) {
      approveMutation.mutate({
        accountId: account.id,
        approvalLevel: level as any,
      });
    }
  };

  const handleReject = (account: AccountPayable) => {
    setAccountToReject(account);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (accountToReject && rejectionReason) {
      const level = getApprovalLevel(accountToReject.status);
      if (level) {
        rejectMutation.mutate({
          accountId: accountToReject.id,
          approvalLevel: level as any,
          reason: rejectionReason,
        });
      }
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setAccountToReject(null);
    }
  };

  const handleMarkAsPaid = (account: AccountPayable) => {
    markAsPaidMutation.mutate({
      accountId: account.id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Nenhuma conta encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{account.description}</h3>
                    {account.urgency_level === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Favorecido: {account.payee_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Valor: R$ {account.amount.toFixed(2)}</span>
                    <span>
                      Vencimento: {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span>Congregação: {account.congregation?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(account.status)}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Solicitado em: {format(new Date(account.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Conta a Pagar</DialogTitle>
                      </DialogHeader>
                      <AccountPayableDetails accountId={account.id} />
                    </DialogContent>
                  </Dialog>

                  {showApprovalActions && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(account)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(account)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </>
                  )}

                  {showPaymentActions && account.status === 'approved' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMarkAsPaid(account)}
                      disabled={markAsPaidMutation.isPending}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Rejeição */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Conta a Pagar</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição desta conta a pagar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Descreva o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectionReason('');
                  setAccountToReject(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountPayableList;