
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CongregationForm from '@/components/congregations/CongregationForm';
import CongregationTable from '@/components/congregations/CongregationTable';
import { useCongregations } from '@/hooks/useCongregationData';

const Congregations = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState<any>(null);
  const { data: congregations, isLoading } = useCongregations();

  const handleEdit = (congregation: any) => {
    setEditingCongregation(congregation);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCongregation(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Congregações</h1>
            <p className="text-gray-600 mt-2">Gerencie as congregações da igreja</p>
          </div>
          
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
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Carregando congregações...</div>
          </div>
        ) : (
          <CongregationTable 
            congregations={congregations || []}
            onEdit={handleEdit}
          />
        )}
      </div>
    </Layout>
  );
};

export default Congregations;
