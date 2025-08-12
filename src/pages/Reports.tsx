
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReportsFilters from '@/components/reports/ReportsFilters';
import ReconciliationCharts from '@/components/reports/ReconciliationCharts';
import PaymentMethodsBreakdown from '@/components/reports/PaymentMethodsBreakdown';
import ExportControls from '@/components/reports/ExportControls';
import { ReportsProvider } from '@/contexts/ReportsContext';

const Reports = () => {
  const { userAccessProfile } = useAuth();

  // Only allow specific profiles to access reports
  if (!['Admin', 'Gerente Financeiro', 'Pastor', 'Analista'].includes(userAccessProfile || '')) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar os relatórios.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ReportsProvider>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">
              Análise visual e exportação de dados das conciliações
            </p>
          </div>

          <ReportsFilters />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gráficos de Conciliações</CardTitle>
                <CardDescription>
                  Visualização por mês e congregação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationCharts />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formas de Pagamento</CardTitle>
                <CardDescription>
                  Distribuição por método de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodsBreakdown />
              </CardContent>
            </Card>
          </div>

          <ExportControls />
        </div>
      </Layout>
    </ReportsProvider>
  );
};

export default Reports;
