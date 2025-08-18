import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import ImportAccountsContent from '@/components/accounts-payable/ImportAccountsContent';

const ImportAccounts = () => {
  const { canInsertModule } = usePermissions();
  
  const canImport = canInsertModule('contas-pagar');

  if (!canImport) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Você não tem permissão para importar contas a pagar.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Importar Contas a Pagar</h1>
          <p className="text-muted-foreground mt-2">
            Importe múltiplas contas a pagar através de planilha CSV ou Excel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importação em Lote</CardTitle>
            <CardDescription>
              Faça upload de um arquivo CSV ou Excel com as contas a pagar para importação automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportAccountsContent />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ImportAccounts;