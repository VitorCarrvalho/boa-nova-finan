
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import SupplierTable from '@/components/suppliers/SupplierTable';
import SupplierForm from '@/components/suppliers/SupplierForm';
import { usePermissions } from '@/hooks/usePermissions';

const Suppliers = () => {
  const [showForm, setShowForm] = useState(false);
  const { canViewModule, canInsertModule } = usePermissions();
  
  const canView = canViewModule('fornecedores');
  const canInsert = canInsertModule('fornecedores');

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
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600 mt-1">Gerencie os fornecedores da igreja</p>
          </div>
          {canInsert && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          )}
        </div>

        <SupplierTable />

        <SupplierForm 
          open={showForm} 
          onOpenChange={setShowForm}
        />
      </div>
    </Layout>
  );
};

export default Suppliers;
