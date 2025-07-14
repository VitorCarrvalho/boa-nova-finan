import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAccountPayable, useAccountPayableApprovals } from '@/hooks/useAccountsPayable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AccountPayableDetailsProps {
  accountId: string;
}

const AccountPayableDetails: React.FC<AccountPayableDetailsProps> = ({ accountId }) => {
  const { data: account, isLoading: accountLoading } = useAccountPayable(accountId);
  const { data: approvals, isLoading: approvalsLoading } = useAccountPayableApprovals(accountId);

  if (accountLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!account) {
    return <div>Conta não encontrada</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending_management: { label: 'Pendente - Gerência', variant: 'secondary' as const, icon: Clock },
      pending_director: { label: 'Pendente - Diretoria', variant: 'secondary' as const, icon: Clock },
      pending_president: { label: 'Pendente - Presidência', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
    
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">{account.description}</h2>
            {account.urgency_level === 'urgent' && (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <p className="text-muted-foreground">
            ID: {account.id.slice(0, 8)}...
          </p>
        </div>
        <div className="text-right">
          {getStatusBadge(account.status)}
          <p className="text-2xl font-bold mt-2">R$ {account.amount.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Categoria:</span>
              <p className="text-muted-foreground">{account.category?.name}</p>
            </div>
            <div>
              <span className="font-medium">Data de Vencimento:</span>
              <p className="text-muted-foreground">
                {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div>
              <span className="font-medium">Forma de Pagamento:</span>
              <p className="text-muted-foreground">{account.payment_method}</p>
            </div>
            <div>
              <span className="font-medium">Congregação:</span>
              <p className="text-muted-foreground">{account.congregation?.name}</p>
            </div>
            {account.invoice_number && (
              <div>
                <span className="font-medium">Nota Fiscal:</span>
                <p className="text-muted-foreground">{account.invoice_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do Favorecido */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Favorecido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Nome/Razão Social:</span>
              <p className="text-muted-foreground">{account.payee_name}</p>
            </div>
            {account.bank_name && (
              <div>
                <span className="font-medium">Banco:</span>
                <p className="text-muted-foreground">{account.bank_name}</p>
              </div>
            )}
            {account.bank_agency && (
              <div>
                <span className="font-medium">Agência:</span>
                <p className="text-muted-foreground">{account.bank_agency}</p>
              </div>
            )}
            {account.bank_account && (
              <div>
                <span className="font-medium">Conta:</span>
                <p className="text-muted-foreground">{account.bank_account}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      {(account.observations || account.urgency_description || account.is_recurring) && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {account.observations && (
              <div>
                <span className="font-medium">Observações:</span>
                <p className="text-muted-foreground">{account.observations}</p>
              </div>
            )}
            {account.urgency_description && (
              <div>
                <span className="font-medium">Motivo da Urgência:</span>
                <p className="text-muted-foreground">{account.urgency_description}</p>
              </div>
            )}
            {account.is_recurring && (
              <div>
                <span className="font-medium">Recorrência:</span>
                <p className="text-muted-foreground">
                  Sim - {account.recurrence_frequency === 'monthly' ? 'Mensal' : 
                        account.recurrence_frequency === 'quarterly' ? 'Trimestral' : 'Anual'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Aprovações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Aprovações</CardTitle>
          <CardDescription>Acompanhe o fluxo de aprovação desta conta</CardDescription>
        </CardHeader>
        <CardContent>
          {approvalsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : approvals && approvals.length > 0 ? (
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <div key={approval.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {approval.action === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {approval.action === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        por {approval.approver?.name || 'Sistema'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(approval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                    {approval.notes && (
                      <p className="text-sm mt-1 p-2 bg-muted rounded">
                        {approval.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma aprovação registrada ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Informações de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Solicitado por:</span>
            <p className="text-muted-foreground">{account.requester?.name || 'Não informado'}</p>
          </div>
          <div>
            <span className="font-medium">Data da Solicitação:</span>
            <p className="text-muted-foreground">
              {format(new Date(account.requested_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
          {account.approved_at && (
            <div>
              <span className="font-medium">Data da Aprovação:</span>
              <p className="text-muted-foreground">
                {format(new Date(account.approved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}
          {account.paid_at && (
            <div>
              <span className="font-medium">Data do Pagamento:</span>
              <p className="text-muted-foreground">
                {format(new Date(account.paid_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}
          {account.rejected_at && (
            <div>
              <span className="font-medium">Data da Rejeição:</span>
              <p className="text-muted-foreground">
                {format(new Date(account.rejected_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          )}
          {account.rejection_reason && (
            <div>
              <span className="font-medium">Motivo da Rejeição:</span>
              <p className="text-muted-foreground p-2 bg-red-50 rounded border border-red-200">
                {account.rejection_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPayableDetails;