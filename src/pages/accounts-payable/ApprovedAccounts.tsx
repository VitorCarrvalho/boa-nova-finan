
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { usePermissions } from '@/hooks/usePermissions';
import AccountPayableList from '@/components/accounts-payable/AccountPayableList';
import { Search } from 'lucide-react';

const ApprovedAccounts = () => {
  const { canViewApprovedAccounts, canEditModule } = usePermissions();
  const [filters, setFilters] = useState({
    search: '',
    date_from: '',
    date_to: '',
  });

  const canView = canViewApprovedAccounts();
  const canMarkAsPaid = canEditModule('contas-pagar');

  const { data: accounts, isLoading } = useAccountsPayable({
    status: 'approved',
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  const filteredAccounts = accounts?.filter(account => 
    !filters.search || 
    account.description.toLowerCase().includes(filters.search.toLowerCase()) ||
    account.payee_name.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (!canView) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-gray-500">Você não tem permissão para acessar este módulo.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contas Aprovadas</h1>
          <p className="text-muted-foreground mt-2">
            Contas aprovadas aguardando pagamento
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre as contas por período ou descrição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="date_from">Data Inicial</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">Data Final</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <AccountPayableList 
          accounts={filteredAccounts || []} 
          isLoading={isLoading}
          showPaymentActions={canMarkAsPaid}
        />
      </div>
    </Layout>
  );
};

export default ApprovedAccounts;
