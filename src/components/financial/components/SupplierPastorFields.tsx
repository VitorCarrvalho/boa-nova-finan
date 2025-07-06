
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FinancialFormData } from '../hooks/useFinancialForm';

interface SupplierPastorFieldsProps {
  formData: FinancialFormData;
  setFormData: React.Dispatch<React.SetStateAction<FinancialFormData>>;
  suppliers?: Array<{ id: string; name: string }>;
  availablePastors: Array<{ id: string; name: string; email: string | null }>;
  isCurrentUserPastor: boolean;
}

export const SupplierPastorFields: React.FC<SupplierPastorFieldsProps> = ({
  formData,
  setFormData,
  suppliers,
  availablePastors,
  isCurrentUserPastor
}) => {
  const showSupplierField = formData.type === 'expense' && formData.category === 'supplier';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {showSupplierField && (
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Select 
            value={formData.supplier_id} 
            onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers?.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="responsible_pastor">Pastor Responsável *</Label>
        <Select 
          value={formData.responsible_pastor_id} 
          onValueChange={(value) => setFormData({ ...formData, responsible_pastor_id: value })}
          disabled={isCurrentUserPastor}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o pastor" />
          </SelectTrigger>
          <SelectContent>
            {availablePastors.map((pastor) => (
              <SelectItem key={pastor.id} value={pastor.id}>
                {pastor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
