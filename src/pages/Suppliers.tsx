
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import SupplierTable from '@/components/suppliers/SupplierTable';
import SupplierForm from '@/components/suppliers/SupplierForm';

const Suppliers = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
            <p className="text-gray-600 mt-1">Gerencie os fornecedores da igreja</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
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
