
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import FinancialForm from '@/components/financial/FinancialForm';
import FinancialTable from '@/components/financial/FinancialTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

const Financial = () => {
  const [showForm, setShowForm] = useState(false);
  const { canViewModule, canInsertModule } = usePermissions();
  
  const canView = canViewModule('financeiro');
  const canInsert = canInsertModule('financeiro');

  const handleFormSuccess = () => {
    setShowForm(false);
    // Os dados serão atualizados automaticamente via React Query
  };

  if (!canView) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-gray-500">Você não tem permissão para acessar este módulo.</p>
        </div>
      </Layout>
    );
  }

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
          {canInsert && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Cancelar' : 'Novo Registro'}
            </Button>
          )}
        </div>

        {showForm && (
          <FinancialForm onSuccess={handleFormSuccess} />
        )}

        <FinancialTable />
      </div>
    </Layout>
  );
};

export default Financial;
