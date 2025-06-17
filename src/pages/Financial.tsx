
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import FinancialForm from '@/components/financial/FinancialForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Financial = () => {
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
    // Aqui você pode atualizar a lista de registros
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
            <p className="text-gray-600 mt-2">
              Gerencie as finanças da igreja
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Registro
          </Button>
        </div>

        {showForm && (
          <FinancialForm onSuccess={handleFormSuccess} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Registros Financeiros</CardTitle>
            <CardDescription>
              Histórico de entradas e saídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Nenhum registro encontrado. Clique em "Novo Registro" para adicionar.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Financial;
