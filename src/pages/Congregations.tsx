
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CongregationForm from '@/components/congregations/CongregationForm';
import CongregationTable from '@/components/congregations/CongregationTable';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';

const Congregations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState<any>(null);
  const { data: congregations, isLoading } = useCongregations();
  const { userRole } = useAuth();

  const handleEdit = (congregation: any) => {
    setEditingCongregation(congregation);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCongregation(null);
  };

  // Only admins and superadmins can create/edit congregations
  const canManageCongregations = userRole === 'admin' || userRole === 'superadmin';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Congregações</h1>
            <p className="text-gray-600 mt-2">
              {canManageCongregations ? 'Gerencie as congregações da igreja' : 'Visualize as congregações da igreja'}
            </p>
          </div>
          
          {canManageCongregations && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Congregação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCongregation ? 'Editar Congregação' : 'Nova Congregação'}
                  </DialogTitle>
                </DialogHeader>
                <CongregationForm 
                  congregation={editingCongregation}
                  onClose={handleCloseForm}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Carregando congregações...</div>
          </div>
        ) : (
          <CongregationTable 
            congregations={congregations || []}
            onEdit={canManageCongregations ? handleEdit : undefined}
          />
        )}
      </div>
    </Layout>
  );
};

export default Congregations;
