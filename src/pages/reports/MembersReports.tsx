
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MembersReports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Membros</h1>
          <p className="text-gray-600 mt-2">
            Análise e relatórios dos membros da igreja
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em Desenvolvimento</CardTitle>
            <CardDescription>
              Os relatórios de membros estarão disponíveis em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta seção incluirá relatórios detalhados sobre membros, incluindo:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Lista de membros por congregação</li>
              <li>Membros por ministério</li>
              <li>Relatório de aniversariantes</li>
              <li>Estatísticas de crescimento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MembersReports;
