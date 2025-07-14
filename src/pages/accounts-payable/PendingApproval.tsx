
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { useAuth } from '@/contexts/AuthContext';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';
import { Search } from 'lucide-react';

const PendingApproval = () => {
  const { userRole } = useAuth();
  const [filters, setFilters] = useState({
    status: 'all',
    congregation_id: '',
    search: '',
  });

  // Determinar quais status o usuário pode ver baseado no seu perfil
  const getApprovalStatuses = () => {
    console.log('UserRole:', userRole);
    
    switch (userRole) {
      case 'admin':
      case 'superadmin':
        // Admins podem ver contas em qualquer nível de aprovação
        return ['pending_management', 'pending_director', 'pending_president'];
      
      case 'gerente':
        // Gerentes podem ver contas no nível management
        return ['pending_management'];
      
      case 'diretor':
        // Diretores podem ver contas no nível director
        return ['pending_director'];
      
      case 'presidente':
        // Presidentes podem ver contas no nível president
        return ['pending_president'];
      
      default:
        // Outros perfis não podem ver contas pendentes de aprovação
        return [];
    }
  };

  // Obter status que o usuário pode ver
  const userApprovalStatuses = getApprovalStatuses();
  
  // Se não há status que o usuário pode ver, não buscar dados
  const shouldFetch = userApprovalStatuses.length > 0;

  const { data: accounts, isLoading } = useAccountsPayable({
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    congregation_id: filters.congregation_id || undefined,
  });

  // Filtrar contas que o usuário pode ver e aplicar filtros de busca
  const filteredAccounts = shouldFetch ? accounts?.filter(account => {
    // Primeiro filtro: verificar se o usuário pode ver este status
    const canView = userApprovalStatuses.includes(account.status);
    console.log(`Account ${account.id} status: ${account.status}, Can view: ${canView}`);
    
    // Segundo filtro: aplicar busca textual
    const matchesSearch = !filters.search || 
      account.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      account.payee_name.toLowerCase().includes(filters.search.toLowerCase());
    
    return canView && matchesSearch;
  }) : [];

  console.log('Total accounts:', accounts?.length);
  console.log('Filtered accounts:', filteredAccounts?.length);
  console.log('User approval statuses:', userApprovalStatuses);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pendentes de Aprovação</h1>
          <p className="text-muted-foreground mt-2">
            Contas aguardando aprovação no sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre as contas por status, congregação ou descrição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
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

              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por descrição ou favorecido"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!shouldFetch ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                Você não tem permissão para visualizar contas pendentes de aprovação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <AccountPayableList 
            accounts={filteredAccounts || []} 
            isLoading={isLoading}
            showActions={false}
          />
        )}
      </div>
    </Layout>
  );
};

export default PendingApproval;
