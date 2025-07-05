
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PropertyFieldsProps {
  register: UseFormRegister<any>;
  hasOwnProperty: boolean;
}

const PropertyFields: React.FC<PropertyFieldsProps> = ({ register, hasOwnProperty }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="has_own_property"
          {...register('has_own_property')}
        />
        <Label htmlFor="has_own_property">Possui imóvel próprio</Label>
      </div>

      {!hasOwnProperty && (
        <div>
          <Label htmlFor="rent_value">Valor do Aluguel (R$)</Label>
          <Input
            id="rent_value"
            type="number"
            step="0.01"
            {...register('rent_value', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          {...register('is_active')}
        />
        <Label htmlFor="is_active">Congregação ativa</Label>
      </div>
    </div>
  );
};

export default PropertyFields;
