import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBatchApproval, useBatchRejection } from '@/hooks/useBatchApproval';
import { AccountPayable } from '@/hooks/useAccountsPayable';
import { useAuth } from '@/contexts/AuthContext';
import { validateApprovalPermission } from '@/utils/accountsPayableUtils';
import { Check, X, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BatchApprovalActionsProps {
  accounts: AccountPayable[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const BatchApprovalActions: React.FC<BatchApprovalActionsProps> = ({
  accounts,
  onSelectionChange
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [batchNotes, setBatchNotes] = useState('');
  const [batchRejectionReason, setBatchRejectionReason] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  
  const { getUserAccessProfile } = useAuth();
  const batchApprovalMutation = useBatchApproval();
  const batchRejectionMutation = useBatchRejection();

  // Filtrar contas que o usuário pode aprovar
  const approvableAccounts = accounts.filter(account => {
    const userAccessProfile = getUserAccessProfile();
    if (!userAccessProfile) return false;
    
    const validationResult = validateApprovalPermission(
      userAccessProfile,
      account.status as any,
      true
    );
    return validationResult.canApprove;
  });

  const getApprovalLevel = (status: string) => {
    switch (status) {
      case 'pending_management': return 'management';
      case 'pending_director': return 'director';
      case 'pending_president': return 'president';
      default: return null;
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedAccounts, accountId]
      : selectedAccounts.filter(id => id !== accountId);
    
    setSelectedAccounts(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? approvableAccounts.map(acc => acc.id) : [];
    setSelectedAccounts(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleBatchApproval = async () => {
    if (selectedAccounts.length === 0) return;

    // Agrupar por nível de aprovação
    const accountsByLevel = selectedAccounts.reduce((acc, accountId) => {
      const account = approvableAccounts.find(a => a.id === accountId);
      if (!account) return acc;
      
      const level = getApprovalLevel(account.status);
      if (!level) return acc;
      
      if (!acc[level]) acc[level] = [];
      acc[level].push(accountId);
      return acc;
    }, {} as Record<string, string[]>);

    // Processar cada nível
    for (const [level, accountIds] of Object.entries(accountsByLevel)) {
      await batchApprovalMutation.mutateAsync({
        accountIds,
        approvalLevel: level as any,
        notes: batchNotes
      });
    }

    setIsApprovalDialogOpen(false);
    setBatchNotes('');
    setSelectedAccounts([]);
  };

  const handleBatchRejection = async () => {
    if (selectedAccounts.length === 0 || !batchRejectionReason) return;

    const accountsByLevel = selectedAccounts.reduce((acc, accountId) => {
      const account = approvableAccounts.find(a => a.id === accountId);
      if (!account) return acc;
      
      const level = getApprovalLevel(account.status);
      if (!level) return acc;
      
      if (!acc[level]) acc[level] = [];
      acc[level].push(accountId);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [level, accountIds] of Object.entries(accountsByLevel)) {
      await batchRejectionMutation.mutateAsync({
        accountIds,
        approvalLevel: level as any,
        reason: batchRejectionReason
      });
    }

    setIsRejectionDialogOpen(false);
    setBatchRejectionReason('');
    setSelectedAccounts([]);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending_management: { label: 'Pend. Gerência', variant: 'secondary' as const },
      pending_director: { label: 'Pend. Diretoria', variant: 'secondary' as const },
      pending_president: { label: 'Pend. Presidência', variant: 'secondary' as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return statusInfo ? <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge> : null;
  };

  if (approvableAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Nenhuma conta disponível para aprovação em lote.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprovação em Lote</CardTitle>
        <CardDescription>
          Selecione múltiplas contas para aprovar ou rejeitar em lote
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de seleção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedAccounts.length === approvableAccounts.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Selecionar todas ({approvableAccounts.length} contas)
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedAccounts.length} selecionada(s)
          </div>
        </div>

        {/* Lista de contas */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {approvableAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <Checkbox
                id={`account-${account.id}`}
                checked={selectedAccounts.includes(account.id)}
                onCheckedChange={(checked) => handleSelectAccount(account.id, !!checked)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {account.description}
                  </p>
                  {getStatusBadge(account.status)}
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                  <span>R$ {account.amount.toFixed(2)}</span>
                  <span>{account.payee_name}</span>
                  <span>
                    Venc: {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botões de ação */}
        {selectedAccounts.length > 0 && (
          <div className="flex space-x-2 pt-4 border-t">
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  disabled={batchApprovalMutation.isPending}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aprovar Selecionadas ({selectedAccounts.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aprovação em Lote</DialogTitle>
                  <DialogDescription>
                    Confirme a aprovação de {selectedAccounts.length} conta(s) selecionada(s).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batch-notes">Observações (opcional)</Label>
                    <Textarea
                      id="batch-notes"
                      value={batchNotes}
                      onChange={(e) => setBatchNotes(e.target.value)}
                      placeholder="Adicione observações sobre esta aprovação em lote..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsApprovalDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleBatchApproval}
                      disabled={batchApprovalMutation.isPending}
                    >
                      {batchApprovalMutation.isPending ? 'Aprovando...' : 'Confirmar Aprovação'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={batchRejectionMutation.isPending}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeitar Selecionadas ({selectedAccounts.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeição em Lote</DialogTitle>
                  <DialogDescription>
                    Informe o motivo da rejeição de {selectedAccounts.length} conta(s) selecionada(s).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batch-rejection-reason">Motivo da Rejeição *</Label>
                    <Textarea
                      id="batch-rejection-reason"
                      value={batchRejectionReason}
                      onChange={(e) => setBatchRejectionReason(e.target.value)}
                      placeholder="Descreva o motivo da rejeição..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRejectionDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleBatchRejection}
                      disabled={batchRejectionMutation.isPending || !batchRejectionReason}
                    >
                      {batchRejectionMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchApprovalActions;