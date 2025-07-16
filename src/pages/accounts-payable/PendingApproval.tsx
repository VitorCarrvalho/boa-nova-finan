
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { usePermissions } from '@/hooks/usePermissions';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';
import { Search } from 'lucide-react';

const PendingApproval = () => {
  const { canViewModule } = usePermissions();
  const [filters, setFilters] = useState({
    status: 'all',
    congregation_id: '',
    search: '',
  });

  const canView = canViewModule('contas-pagar');
  
  // Se não tem permissão para ver contas-pagar, não buscar dados
  const shouldFetch = canView;

  const { data: accounts, isLoading } = useAccountsPayable({
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
    congregation_id: filters.congregation_id || undefined,
  });

  // Filtrar contas pendentes (todos os status de pending) e aplicar filtros de busca
  const filteredAccounts = shouldFetch ? accounts?.filter(account => {
    // Primeiro filtro: apenas status pendentes
    const isPending = ['pending_management', 'pending_director', 'pending_president'].includes(account.status);
    
    // Segundo filtro: aplicar busca textual
    const matchesSearch = !filters.search || 
      account.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      account.payee_name.toLowerCase().includes(filters.search.toLowerCase());
    
    return isPending && matchesSearch;
  }) : [];

  console.log('Total accounts:', accounts?.length);
  console.log('Filtered accounts:', filteredAccounts?.length);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pendentes de Aprovação</h1>
          <p className="text-muted-foreground mt-2">
            Contas aguardando aprovação no sistema (somente visualização)
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
                    <SelectItem value="pending_management">Pendente - Gerência</SelectItem>
                    <SelectItem value="pending_director">Pendente - Diretoria</SelectItem>
                    <SelectItem value="pending_president">Pendente - Presidência</SelectItem>
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
            showApprovalActions={false}
          />
        )}
      </div>
    </Layout>
  );
};

export default PendingApproval;
