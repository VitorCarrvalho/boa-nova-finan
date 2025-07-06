
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SuppliersReports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Fornecedores</h1>
          <p className="text-gray-600 mt-2">
            Análise e relatórios dos fornecedores da igreja
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em Desenvolvimento</CardTitle>
            <CardDescription>
              Os relatórios de fornecedores estarão disponíveis em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta seção incluirá relatórios detalhados sobre fornecedores, incluindo:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Lista de fornecedores ativos</li>
              <li>Histórico de pagamentos</li>
              <li>Ranking de fornecedores por valor</li>
              <li>Contratos e prazos de pagamento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SuppliersReports;
