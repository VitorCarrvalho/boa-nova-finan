import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAccountPayable, useAccountPayableApprovals } from '@/hooks/useAccountsPayable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, FileText, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountPayableDetailsProps {
  accountId: string;
}

const AccountPayableDetails: React.FC<AccountPayableDetailsProps> = ({ accountId }) => {
  const { data: account, isLoading: accountLoading } = useAccountPayable(accountId);
  const { data: approvals, isLoading: approvalsLoading } = useAccountPayableApprovals(accountId);
  const { toast } = useToast();

  const handleDownloadAttachment = async () => {
    if (!account?.attachment_url) return;

    try {
      // Log the download attempt
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('attachment_downloads').insert({
          account_payable_id: accountId,
          downloaded_by: user.user.id,
          ip_address: null, // Browser can't access IP directly
          user_agent: navigator.userAgent
        });
      }

      // Download the file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('accounts-payable-attachments')
        .download(account.attachment_url);

      if (error) throw error;

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = account.attachment_filename || 'comprovante.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Comprovante baixado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao baixar o comprovante. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

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
          {account.status === 'paid' && account.attachment_url && (
            <Button 
              onClick={handleDownloadAttachment}
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Comprovante
            </Button>
          )}
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
          <CardDescription>Acompanhe o fluxo de aprovação desta conta por nível</CardDescription>
        </CardHeader>
        <CardContent>
          {approvalsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : approvals && approvals.length > 0 ? (
            <div className="space-y-6">
              {/* Nível 1 - Gerência */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="font-semibold">Nível 1 - Gerência</h4>
                </div>
                {(() => {
                  const managementApproval = approvals.find(a => a.approval_level === 'management');
                  return managementApproval ? (
                    <div className="ml-8">
                      <div className="flex items-center gap-2">
                        {managementApproval.action === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {managementApproval.action === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          por {managementApproval.approver?.name || 'Sistema'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {format(new Date(managementApproval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {managementApproval.notes && (
                        <p className="text-sm mt-1 ml-6 p-2 bg-muted rounded">
                          {managementApproval.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-8">Aguardando aprovação da gerência</p>
                  );
                })()}
              </div>

              {/* Nível 2 - Diretoria */}
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="font-semibold">Nível 2 - Diretoria</h4>
                </div>
                {(() => {
                  const directorApproval = approvals.find(a => a.approval_level === 'director');
                  return directorApproval ? (
                    <div className="ml-8">
                      <div className="flex items-center gap-2">
                        {directorApproval.action === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {directorApproval.action === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          por {directorApproval.approver?.name || 'Sistema'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {format(new Date(directorApproval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {directorApproval.notes && (
                        <p className="text-sm mt-1 ml-6 p-2 bg-muted rounded">
                          {directorApproval.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-8">Aguardando aprovação da diretoria</p>
                  );
                })()}
              </div>

              {/* Nível 3 - Presidência */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="font-semibold">Nível 3 - Presidência</h4>
                </div>
                {(() => {
                  const presidentApproval = approvals.find(a => a.approval_level === 'president');
                  return presidentApproval ? (
                    <div className="ml-8">
                      <div className="flex items-center gap-2">
                        {presidentApproval.action === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {presidentApproval.action === 'approved' ? 'Aprovado' : 'Rejeitado'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          por {presidentApproval.approver?.name || 'Sistema'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {format(new Date(presidentApproval.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {presidentApproval.notes && (
                        <p className="text-sm mt-1 ml-6 p-2 bg-muted rounded">
                          {presidentApproval.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-8">Aguardando aprovação da presidência</p>
                  );
                })()}
              </div>
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