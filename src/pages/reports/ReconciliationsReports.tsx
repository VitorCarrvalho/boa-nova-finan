
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReconciliationSubmissions from '@/components/reports/financial/ReconciliationSubmissions';

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

        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="submissions">Conciliações Enviadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conciliações</CardTitle>
                <CardDescription>
                  Visualize e exporte o histórico completo das conciliações enviadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReconciliationSubmissions />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReconciliationsReports;
