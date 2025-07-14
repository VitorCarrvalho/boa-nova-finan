import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAuth } from '@/contexts/AuthContext';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';

const AuthorizeAccounts = () => {
  const { user, userRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  // Determinar quais status o usuário pode aprovar baseado no seu perfil
  const getApprovalStatuses = () => {
    console.log('UserRole:', userRole);
    
    switch (userRole) {
      case 'admin':
      case 'superadmin':
        // Admins podem aprovar em qualquer nível
        return ['pending_management', 'pending_director', 'pending_president'];
      
      case 'gerente':
        // Gerentes podem aprovar no nível management
        return ['pending_management'];
      
      case 'diretor':
        // Diretores podem aprovar no nível director
        return ['pending_director'];
      
      case 'presidente':
        // Presidentes podem aprovar no nível president
        return ['pending_president'];
      
      default:
        // Outros perfis não podem aprovar
        return [];
    }
  };

  // Obter status que o usuário pode aprovar
  const userApprovalStatuses = getApprovalStatuses();
  
  // Se não há status que o usuário pode aprovar, não buscar dados
  const shouldFetch = userApprovalStatuses.length > 0;
  
  const { data: accounts, isLoading } = useAccountsPayable({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Filtrar contas que o usuário pode aprovar
  const approvableAccounts = shouldFetch ? accounts?.filter(account => {
    const canApprove = userApprovalStatuses.includes(account.status);
    console.log(`Account ${account.id} status: ${account.status}, Can approve: ${canApprove}`);
    return canApprove;
  }) : [];

  console.log('Total accounts:', accounts?.length);
  console.log('Approvable accounts:', approvableAccounts?.length);
  console.log('User approval statuses:', userApprovalStatuses);

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
                   {userApprovalStatuses.includes('pending_management') && (
                     <SelectItem value="pending_management">Pendente - Gerência</SelectItem>
                   )}
                   {userApprovalStatuses.includes('pending_director') && (
                     <SelectItem value="pending_director">Pendente - Diretoria</SelectItem>
                   )}
                   {userApprovalStatuses.includes('pending_president') && (
                     <SelectItem value="pending_president">Pendente - Presidência</SelectItem>
                   )}
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
          <AccountPayableList 
            accounts={approvableAccounts || []} 
            isLoading={isLoading}
            showApprovalActions={true}
          />
        )}
      </div>
    </Layout>
  );
};

export default AuthorizeAccounts;