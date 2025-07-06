
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReconciliationsReports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Conciliações</h1>
          <p className="text-gray-600 mt-2">
            Análise detalhada das conciliações financeiras
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em Desenvolvimento</CardTitle>
            <CardDescription>
              Os relatórios específicos de conciliações estarão disponíveis em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta seção incluirá relatórios detalhados sobre conciliações, incluindo:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Status de conciliações por congregação</li>
              <li>Histórico de aprovações</li>
              <li>Valores transferidos por período</li>
              <li>Comparativo entre congregações</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReconciliationsReports;
