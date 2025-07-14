
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAuth } from '@/contexts/AuthContext';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';

const AuthorizeAccounts = () => {
  const { user, userRole } = useAuth();

  // Determinar qual status o usuário pode aprovar baseado no seu perfil
  const getUserSpecificStatus = () => {
    console.log('UserRole:', userRole);
    
    switch (userRole) {
      case 'gerente':
        return 'pending_management';
      
      case 'diretor':
        return 'pending_director';
      
      case 'presidente':
        return 'pending_president';
      
      case 'admin':
      case 'superadmin':
        // Admins podem ver todos os status, manter comportamento atual
        return undefined;
      
      default:
        return null; // Outros perfis não podem ver nada
    }
  };

  // Obter status específico do usuário
  const userSpecificStatus = getUserSpecificStatus();
  
  // Se não há status que o usuário pode ver, não buscar dados
  const shouldFetch = userSpecificStatus !== null;

  console.log('Should fetch:', shouldFetch);
  console.log('User specific status:', userSpecificStatus);

  const { data: accounts, isLoading } = useAccountsPayable({
    status: userSpecificStatus,
  });

  console.log('Total accounts fetched:', accounts?.length);
  console.log('Accounts data:', accounts);

  // Para admins, mostrar seletor de status (comportamento atual)
  const showStatusFilter = userRole === 'admin' || userRole === 'superadmin';
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: adminAccounts, isLoading: adminLoading } = useAccountsPayable({
    status: showStatusFilter && statusFilter !== 'all' ? statusFilter : undefined,
  });

  const finalAccounts = showStatusFilter ? adminAccounts : accounts;
  const finalLoading = showStatusFilter ? adminLoading : isLoading;

  const getStatusDisplayName = () => {
    switch (userSpecificStatus) {
      case 'pending_management':
        return 'Pendente - Gerência';
      case 'pending_director':
        return 'Pendente - Diretoria';
      case 'pending_president':
        return 'Pendente - Presidência';
      default:
        return 'Todas as contas';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Autorizar Contas</h1>
          <p className="text-muted-foreground mt-2">
            Contas aguardando sua aprovação
          </p>
        </div>

        {showStatusFilter ? (
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
        ) : userSpecificStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Filtro Ativo</CardTitle>
              <CardDescription>
                Exibindo apenas contas do seu nível de aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                Status: {getStatusDisplayName()}
              </div>
            </CardContent>
          </Card>
        )}

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
            accounts={finalAccounts || []} 
            isLoading={finalLoading}
            showApprovalActions={true}
          />
        )}
      </div>
    </Layout>
  );
};

export default AuthorizeAccounts;
