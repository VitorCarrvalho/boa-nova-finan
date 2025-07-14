import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AccountPayableForm from '@/components/accounts-payable/AccountPayableForm';

const NewAccount = () => {
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