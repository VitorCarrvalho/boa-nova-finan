
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReconciliationForm from '@/components/reconciliations/ReconciliationForm';
import ReconciliationTable from '@/components/reconciliations/ReconciliationTable';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';

const Reconciliations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReconciliation, setEditingReconciliation] = useState<any>(null);
  const { data: reconciliations, isLoading } = useReconciliations();
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();

  const handleEdit = (reconciliation: any) => {
    setEditingReconciliation(reconciliation);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReconciliation(null);
  };

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isPastor = userRole === 'pastor';
  const canSubmit = isPastor && congregationAccess?.hasAccess;

  // Reconciliations are already filtered in the hook based on user role and congregation access

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conciliações</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? 'Gerencie as conciliações financeiras mensais' : 'Envie suas conciliações financeiras mensais'}
            </p>
          </div>
          
          {canSubmit && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Conciliação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingReconciliation ? 'Editar Conciliação' : 'Nova Conciliação'}
                  </DialogTitle>
                </DialogHeader>
                <ReconciliationForm 
                  reconciliation={editingReconciliation}
                  onClose={handleCloseForm}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!canSubmit && isPastor && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Você não possui acesso para enviar conciliações. Entre em contato com o administrador.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Carregando conciliações...</div>
          </div>
        ) : (
          <ReconciliationTable 
            reconciliations={reconciliations || []}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Layout>
  );
};

export default Reconciliations;
