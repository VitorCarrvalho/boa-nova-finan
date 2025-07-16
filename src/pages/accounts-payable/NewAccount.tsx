import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AccountPayableForm from '@/components/accounts-payable/AccountPayableForm';
import { usePermissions } from '@/hooks/usePermissions';

const NewAccount = () => {
  const { canInsertModule } = usePermissions();
  
  const canCreate = canInsertModule('contas-pagar');

  if (!canCreate) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-gray-500">Você não tem permissão para criar contas a pagar.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Incluir Nova Conta</h1>
          <p className="text-muted-foreground mt-2">
            Cadastre uma nova conta a pagar no sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova Conta a Pagar</CardTitle>
            <CardDescription>
              Preencha as informações da conta a pagar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountPayableForm />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewAccount;