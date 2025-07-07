
import React from 'react';
import { Button } from '@/components/ui/button';

interface SupplierFormActionsProps {
  onCancel: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

const SupplierFormActions = ({ onCancel, isEditing, isLoading }: SupplierFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        type="submit" 
        className="bg-red-600 hover:bg-red-700"
        disabled={isLoading}
      >
        {isEditing ? 'Atualizar' : 'Criar'}
      </Button>
    </div>
  );
};

export default SupplierFormActions;
