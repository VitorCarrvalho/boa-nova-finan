
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { usePermissions } from '@/hooks/usePermissions';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';
import BatchApprovalActions from '@/components/accounts-payable/BatchApprovalActions';

const AuthorizeAccounts = () => {
  const { canViewAuthorizeAccounts } = usePermissions();

  const canApprove = canViewAuthorizeAccounts();
  
  // Se não tem permissão para aprovar contas-pagar, não buscar dados
  const shouldFetch = canApprove;

  console.log('Should fetch:', shouldFetch);

  const [statusFilter, setStatusFilter] = useState('all');

  const { data: accounts, isLoading } = useAccountsPayable({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Filtrar apenas contas pendentes de aprovação
  const pendingAccounts = accounts?.filter(account => 
    ['pending_management', 'pending_director', 'pending_president'].includes(account.status)
  ) || [];

  console.log('Total accounts fetched:', accounts?.length);
  console.log('Pending accounts:', pendingAccounts?.length);

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

        {!shouldFetch ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                Você não tem permissão para aprovar contas a pagar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <BatchApprovalActions accounts={pendingAccounts} />
            <AccountPayableList 
              accounts={pendingAccounts} 
              isLoading={isLoading}
              showApprovalActions={true}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuthorizeAccounts;
