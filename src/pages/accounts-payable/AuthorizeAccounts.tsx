import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAuth } from '@/contexts/AuthContext';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';

const AuthorizeAccounts = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');

  // Determinar quais status o usuário pode aprovar baseado no seu perfil
  const getApprovalStatuses = () => {
    // Aqui você pode implementar a lógica baseada no perfil do usuário
    // Por enquanto, vamos retornar todos os status pendentes
    return ['pending_management', 'pending_director', 'pending_president'];
  };

  const { data: accounts, isLoading } = useAccountsPayable({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Filtrar contas que o usuário pode aprovar
  const approvableAccounts = accounts?.filter(account => {
    const approvalStatuses = getApprovalStatuses();
    return approvalStatuses.includes(account.status);
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Autorizar Contas</h1>
          <p className="text-muted-foreground mt-2">
            Contas aguardando sua aprovação
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre as contas por status de aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending_management">Pendente - Gerência</SelectItem>
                  <SelectItem value="pending_director">Pendente - Diretoria</SelectItem>
                  <SelectItem value="pending_president">Pendente - Presidência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <AccountPayableList 
          accounts={approvableAccounts || []} 
          isLoading={isLoading}
          showApprovalActions={true}
        />
      </div>
    </Layout>
  );
};

export default AuthorizeAccounts;