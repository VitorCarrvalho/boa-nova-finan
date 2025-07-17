
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AccountPayable, useApproveAccount, useRejectAccount, useMarkAsPaid } from '@/hooks/useAccountsPayable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Check, X, Upload, AlertTriangle, FileText } from 'lucide-react';
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [accountToPay, setAccountToPay] = useState<AccountPayable | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { userRole } = useAuth();
  const { hasPermission } = usePermissions();
  const isMobile = useIsMobile();
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

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending_management: 'Pend. Gerência',
      pending_director: 'Pend. Diretoria',
      pending_president: 'Pend. Presidência',
      approved: 'Aprovado',
      paid: 'Pago',
      rejected: 'Rejeitado',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusVariant = (status: string): 'secondary' | 'default' | 'destructive' | 'outline' => {
    const statusMap = {
      pending_management: 'secondary' as const,
      pending_director: 'secondary' as const,
      pending_president: 'secondary' as const,
      approved: 'default' as const,
      paid: 'default' as const,
      rejected: 'destructive' as const,
    };
    return statusMap[status as keyof typeof statusMap] || 'secondary';
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

  // Função para verificar se o usuário pode aprovar determinado status
  const canApprove = (account: AccountPayable) => {
    if (!userRole) return false;
    
    // Verificar se tem permissão básica para aprovar contas-pagar
    if (!hasPermission('contas-pagar', 'approve')) return false;
    
    // Mapear status para níveis de aprovação baseado nos perfis
    // Por enquanto, simplificado - todos com permissão de approve podem aprovar qualquer nível
    // Futuramente pode ser refinado com verificações mais granulares por nível
    switch (account.status) {
      case 'pending_management':
      case 'pending_director':
      case 'pending_president':
        return hasPermission('contas-pagar', 'approve');
      default:
        return false;
    }
  };

  const handleMarkAsPaid = (account: AccountPayable) => {
    setAccountToPay(account);
    setIsPaymentDialogOpen(true);
  };

  const uploadPaymentProof = async (file: File): Promise<{url: string, filename: string}> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `payment-proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('accounts-payable-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('accounts-payable-attachments')
      .getPublicUrl(filePath);

    return { url: publicUrl, filename: file.name };
  };

  const confirmPayment = async () => {
    if (!accountToPay || !paymentFile) return;

    setIsUploading(true);
    try {
      const { url, filename } = await uploadPaymentProof(paymentFile);
      
      markAsPaidMutation.mutate({
        accountId: accountToPay.id,
        attachmentUrl: url,
        attachmentFilename: filename,
        notes: paymentNotes
      });
      
      setIsPaymentDialogOpen(false);
      setPaymentFile(null);
      setPaymentNotes('');
      setAccountToPay(null);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false);
    }
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
      {isMobile ? (
        // Mobile Cards Layout
        <div className="space-y-3">
          {accounts.map((account) => (
            <MobileTableCard
              key={account.id}
              title={account.description}
              subtitle={`Favorecido: ${account.payee_name}`}
              status={{
                label: getStatusLabel(account.status),
                variant: getStatusVariant(account.status)
              }}
              fields={[
                {
                  label: 'Valor',
                  value: `R$ ${account.amount.toFixed(2)}`,
                  className: 'font-semibold'
                },
                {
                  label: 'Vencimento',
                  value: format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })
                },
                {
                  label: 'Congregação',
                  value: account.congregation?.name || 'N/A'
                },
                {
                  label: 'Urgência',
                  value: account.urgency_level === 'urgent' ? (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-600">Urgente</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Normal</span>
                  )
                },
                {
                  label: 'Solicitado em',
                  value: format(new Date(account.created_at), 'dd/MM/yyyy', { locale: ptBR })
                }
              ]}
              actions={[
                {
                  label: 'Detalhes',
                  icon: <Eye className="h-3 w-3" />,
                  onClick: () => setSelectedAccount(account),
                  variant: 'outline'
                },
                ...(showApprovalActions && canApprove(account) ? [
                  {
                    label: 'Aprovar',
                    icon: <Check className="h-3 w-3" />,
                    onClick: () => handleApprove(account),
                    variant: 'default' as const,
                    disabled: approveMutation.isPending
                  },
                  {
                    label: 'Rejeitar',
                    icon: <X className="h-3 w-3" />,
                    onClick: () => handleReject(account),
                    variant: 'destructive' as const,
                    disabled: rejectMutation.isPending
                  }
                ] : []),
                ...(showPaymentActions && account.status === 'approved' ? [
                  {
                    label: 'Marcar Pago',
                    icon: <Upload className="h-3 w-3" />,
                    onClick: () => handleMarkAsPaid(account),
                    variant: 'default' as const,
                    disabled: markAsPaidMutation.isPending
                  }
                ] : [])
              ]}
            />
          ))}
          {accounts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma conta encontrada
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Desktop Cards Layout (original)
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

                    {showApprovalActions && canApprove(account) && (
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
      )}

      {/* Dialog para detalhes em mobile */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Conta a Pagar</DialogTitle>
            </DialogHeader>
            <AccountPayableDetails accountId={selectedAccount.id} />
          </DialogContent>
        </Dialog>
      )}

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

      {/* Dialog de Comprovante de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Pago</DialogTitle>
            <DialogDescription>
              Faça upload do comprovante de pagamento para confirmar o pagamento desta conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {accountToPay && (
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">{accountToPay.description}</p>
                <p className="text-sm text-muted-foreground">
                  Valor: R$ {accountToPay.amount.toFixed(2)} - {accountToPay.payee_name}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="payment-proof">Comprovante de Pagamento *</Label>
              <Input
                id="payment-proof"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: PDF, JPG, PNG
              </p>
            </div>

            {paymentFile && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">{paymentFile.name}</span>
              </div>
            )}

            <div>
              <Label htmlFor="payment-notes">Observações (opcional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Observações sobre o pagamento..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setPaymentFile(null);
                  setPaymentNotes('');
                  setAccountToPay(null);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={confirmPayment}
                disabled={!paymentFile || isUploading || markAsPaidMutation.isPending}
              >
                {isUploading || markAsPaidMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountPayableList;
