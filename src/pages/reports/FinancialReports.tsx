
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncomeExpensesByCongregation from '@/components/reports/financial/IncomeExpensesByCongregation';
import ReconciliationSubmissions from '@/components/reports/financial/ReconciliationSubmissions';
import PaymentsToSuppliers from '@/components/reports/financial/PaymentsToSuppliers';

const FinancialReports = () => {
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600 mt-2">
            Análise detalhada das finanças da igreja
          </p>
        </div>

        <Tabs defaultValue="income-expenses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income-expenses">Receitas e Despesas</TabsTrigger>
            <TabsTrigger value="reconciliations">Conciliações</TabsTrigger>
            <TabsTrigger value="suppliers">Pagamentos a Fornecedores</TabsTrigger>
          </TabsList>

          <TabsContent value="income-expenses">
            <Card>
              <CardHeader>
                <CardTitle>Receitas e Despesas por Congregação</CardTitle>
                <CardDescription>
                  Visualize todas as transações de entrada e saída por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeExpensesByCongregation 
                  transactionTypeFilter={transactionTypeFilter}
                  onTransactionTypeChange={setTransactionTypeFilter}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliations">
            <Card>
              <CardHeader>
                <CardTitle>Envios de Conciliações (Últimos 6 Meses)</CardTitle>
                <CardDescription>
                  Acompanhe todas as conciliações enviadas pelas congregações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationSubmissions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos a Fornecedores</CardTitle>
                <CardDescription>
                  Lista detalhada de todos os pagamentos realizados aos fornecedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentsToSuppliers />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FinancialReports;
