
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import DepartmentTable from '@/components/departments/DepartmentTable';
import DepartmentForm from '@/components/departments/DepartmentForm';
import { usePermissions } from '@/hooks/usePermissions';

const Departments = () => {
  const [showForm, setShowForm] = useState(false);
  const { canViewModule, canInsertModule } = usePermissions();
  
  const canView = canViewModule('departamentos');
  const canInsert = canInsertModule('departamentos');

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
            <h1 className="text-3xl font-bold text-gray-900">Departamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie os departamentos da igreja</p>
          </div>
          {canInsert && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Departamento
            </Button>
          )}
        </div>

        <DepartmentTable />

        <DepartmentForm 
          open={showForm} 
          onOpenChange={setShowForm}
        />
      </div>
    </Layout>
  );
};

export default Departments;
